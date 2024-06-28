import "dotenv/config";

import {
  NotificationType,
  prisma,
  sendNotification,
} from "@repo/backend-common";
import { verify, type JwtPayload } from "jsonwebtoken";
import { WebSocketServer, type WebSocket } from "ws";
import { handleDelete, handleEdit } from "./handlers";

const wss = new WebSocketServer({
  port: parseInt(process.env.PORT || "3000"),
});

const connectedSockets = new Map<string, WebSocket>();

wss.on("connection", async (ws, req) => {
  // http://localhost:3000/:username?token=:token
  const url = new URL(req.url || "", "http://localhost:3000");

  const token = url.searchParams.get("token");
  if (!token) return ws.close();

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const username = url.pathname.slice(1);
    if (!username) return ws.close();

    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) return ws.close();

    if (connectedSockets.has(`${payload.user}:${target.id}`)) {
      connectedSockets.get(`${payload.user}:${target.id}`)?.close();
      connectedSockets.delete(`${payload.user}:${target.id}`);
    }

    connectedSockets.set(`${payload.user}:${target.id}`, ws);

    ws.on("close", () => {
      connectedSockets.delete(`${payload.user}:${target.id}`);
    });

    ws.on("message", async (data) => {
      const command = data.toString();

      if (
        !command.startsWith("+") &&
        !command.startsWith("-") &&
        !command.startsWith("!") &&
        !command.startsWith("@")
      )
        return;
      if (command.length > 500) return;

      const prefix = command[0];
      let message = command.slice(1).trim();
      let replyId;
      if (!message) return;

      switch (prefix) {
        case "-":
          if (!(await handleDelete(message, payload.user, username))) return;

          connectedSockets.get(`${target!.id}:${payload.user}`)?.send(command);
          ws.send(command);
          return;
        case "!":
          if (!(await handleEdit(message, payload.user, username))) return;

          connectedSockets.get(`${target!.id}:${payload.user}`)?.send(command);
          ws.send(command);
          return;
        case "@":
          replyId = message.slice(0, 24);
          message = message.slice(24);
          if (!replyId || !message) return;

          const origin = await prisma.message.findFirst({
            where: {
              id: replyId,
            },
          });

          if (!origin) return;
          break;
      }

      const result = await prisma.message.create({
        data: {
          text: message,
          senderId: payload.user,
          receiverId: target!.id,
          replyId,
        },
      });

      const user = await prisma.user.findUnique({
        where: {
          id: payload.user,
        },
        select: {
          username: true,
        },
      });

      sendNotification(target!.id, NotificationType.DM, {
        user: user!.username,
        userId: payload.user,
        message,
      });

      connectedSockets
        .get(`${target!.id}:${payload.user}`)
        ?.send("+" + JSON.stringify(result));
      ws.send("+" + JSON.stringify(result));
    });
  } catch (err) {
    ws.close();
  }
});
