import "dotenv/config";

import { createAdapter } from "@socket.io/redis-streams-adapter";
import { Redis } from "ioredis";
import { Server, type Socket } from "socket.io";
import {
  authenticate,
  getChat,
  handleDelete,
  handleEdit,
  handleReply,
  handleSend,
} from "./handlers";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const redisClient = new Redis(process.env.REDIS_URL!);

async function main() {
  const io = new Server(PORT, {
    cors: {
      origin: "*",
    },
    adapter: createAdapter(redisClient),
  });

  io.on("connection", async (socket) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const user = authenticate(token);

    if (!user) return socket.disconnect(true);

    const chatId = socket.handshake.query.chat as string;
    const chat = await getChat(chatId);

    if (!chat) return socket.disconnect(true);

    socket.join(chatId);
    attachListeners(socket, user, chatId);
  });

  function attachListeners(socket: Socket, userId: string, chatId: string) {
    socket.on("delete", async (messageId: string) => {
      const res = await handleDelete(messageId, userId, chatId);
      if (res) io.to(chatId).emit("delete", messageId);
    });
    socket.on("edit", async (messageId: string, text: string) => {
      const res = await handleEdit(messageId, userId, chatId, text);
      if (res) io.to(chatId).emit("edit", messageId, text);
    });
    socket.on("reply", async (messageId: string, originId: string) => {
      const res = await handleReply(messageId, userId, chatId, originId);
      if (res) io.to(chatId).emit("send", res);
    });
    socket.on("send", async (text: string) => {
      const res = await handleSend(text, userId, chatId);
      if (res) io.to(chatId).emit("send", res);
    });
  }
}

redisClient.on("connect", main);
