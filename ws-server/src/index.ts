import "dotenv/config";
import {
  NotificationType,
  prisma,
  sendNotification,
} from "@repo/backend-common";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { serve } from "@hono/node-server";
import { verify } from "hono/jwt";
import type { WSContext } from "hono/ws";

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const connectedSockets = new Map<string, WSContext>();

app.get(
  "/:username",
  async (ctx, next) => {
    const token = ctx.req.query("token");
    if (!token) return ctx.json({ error: "Unauthorized" }, 401);

    try {
      const payload = await verify(token, process.env.JWT_SECRET!);

      ctx.set("jwtPayload", payload);
      return next();
    } catch (e) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
  },
  upgradeWebSocket(async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const username = ctx.req.param("username");
    const target = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        id: true,
      },
    });

    return {
      async onMessage(event, ws) {
        const command = event.data.toString();

        if (
          !command.startsWith("+") &&
          !command.startsWith("-") &&
          !command.startsWith("!") &&
          !command.startsWith("@")
        )
          return;
        if (command.length > 500) return;

        const message = command.slice(1).trim();
        if (!message) return;

        if (command.startsWith("-")) {
          const result = await prisma.message.findFirst({
            where: {
              id: message,
              senderId: payload.user,
              receiver: {
                username,
              },
            },
          });

          if (!result) return;

          await prisma.message.delete({
            where: {
              id: message,
            },
          });

          connectedSockets.get(`${target!.id}:${payload.user}`)?.send(command);
          ws.send(command);

          return;
        }

        if (command.startsWith("!")) {
          const id = message.slice(0, 24);
          const text = message.slice(24);

          if (!id || !text) return;

          try {
            const result = await prisma.message.update({
              where: {
                id,
                senderId: payload.user,
                receiver: {
                  username,
                },
              },
              data: {
                text,
              },
            });

            if (!result) return;

            connectedSockets
              .get(`${target!.id}:${payload.user}`)
              ?.send(command);
            ws.send(command);
          } catch (e) {}

          return;
        }

        if (command.startsWith("@")) {
          const id = message.slice(0, 24);
          const content = message.slice(24);

          if (!id || !content) return;

          const origin = await prisma.message.findFirst({
            where: {
              id,
            },
          });

          if (!origin) return;

          const result = await prisma.message.create({
            data: {
              text: content,
              senderId: payload.user,
              receiverId: target!.id,
              replyId: origin.id,
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
            message: content,
          });

          connectedSockets
            .get(`${target!.id}:${payload.user}`)
            ?.send("+" + JSON.stringify(result));
          ws.send("+" + JSON.stringify(result));

          return;
        }

        const result = await prisma.message.create({
          data: {
            text: message,
            senderId: payload.user,
            receiverId: target!.id,
          },
        });

        connectedSockets
          .get(`${target!.id}:${payload.user}`)
          ?.send("+" + JSON.stringify(result));
        ws.send("+" + JSON.stringify(result));
      },
      async onOpen(_, ws) {
        console.log(`[WS] ${payload.user} connected to ${username}`);

        if (!target) {
          ws.send("error:User not found");
          ws.close();
          return;
        }

        (ws.raw as WebSocket).onclose = () => {
          console.log(`[WS] ${payload.user} disconnected from ${username}`);
          connectedSockets.delete(`${payload.user}:${target.id}`);
        };

        connectedSockets.set(`${payload.user}:${target.id}`, ws);
      },
    };
  })
);

const server = serve({
  fetch: app.fetch,
  port: 3000,
});
injectWebSocket(server);
