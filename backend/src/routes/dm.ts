import { prisma } from "@repo/backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";

const hono = new Hono();

async function markRead(chatId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      chatId,
      senderId: {
        not: userId,
      },
      NOT: {
        read: {
          has: userId,
        },
      },
    },
    data: {
      read: {
        push: userId,
      },
    },
  });
}

hono.get("/list", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const payload = ctx.get("jwtPayload");

  const chats = await prisma.chat.findMany({
    where: {
      userIds: {
        has: payload.user,
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  return ctx.json(
    chats.map((chat) => ({
      ...chat,
      lastMessage: chat.messages[0],
      read:
        chat.messages[0].senderId === payload.user ||
        chat.messages[0].read.includes(payload.user),
    }))
  );
});

hono.get(
  "/:id",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userIds: {
          has: payload.user,
        },
      },
    });
    if (!chat) return ctx.json({ error: "Chat not found" }, 404);

    return ctx.json(chat);
  }
);

hono.get(
  "/:id/messages",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");
    let offset = ctx.req.query("offset") || 0;

    if (typeof offset !== "number" || offset < 0) offset = 0;

    const messages = await prisma.message.findMany({
      where: {
        chatId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: 50,
    });

    await markRead(id, payload.user);

    return ctx.json(messages);
  }
);

hono.delete("/:id", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const id = ctx.req.param("id");
  const payload = ctx.get("jwtPayload");

  const chat = await prisma.chat.findFirst({
    where: {
      id,
      userIds: {
        has: payload.user,
      },
    },
  });
  if (!chat) return ctx.json({ error: "Chat not found" }, 404);

  const result = await prisma.chat.update({
    where: {
      id,
    },
    data: {
      userIds: {
        set: chat.userIds.filter((userId) => userId !== payload.user),
      },
    },
  });

  return ctx.json(result);
});

hono.post(
  "/:id/read",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

    await markRead(id, payload.user);

    return ctx.json({ success: true });
  }
);

export default hono;
