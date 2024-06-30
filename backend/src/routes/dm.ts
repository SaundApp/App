import { zValidator } from "@hono/zod-validator";
import { prisma } from "@repo/backend-common";
import { createChatSchema } from "@repo/form-types";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { createAvatar } from "../lib/images";

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
    take: 50,
  });

  return ctx.json(
    chats
      .sort((a, b) => {
        if (!a.messages[0]) return 1;
        if (!b.messages[0]) return -1;
        return (
          b.messages[0].createdAt.getTime() - a.messages[0].createdAt.getTime()
        );
      })
      .map((chat) => ({
        ...chat,
        lastMessage: chat.messages[0],
        read:
          !chat.messages[0] ||
          chat.messages[0]?.senderId === payload.user ||
          chat.messages[0]?.read.includes(payload.user),
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

  if (result.userIds.length === 0) {
    await prisma.chat.delete({
      where: {
        id,
      },
    });
  }

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

hono.post(
  "/create",
  jwt({ secret: process.env.JWT_SECRET! }),
  zValidator("json", createChatSchema),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const body = ctx.req.valid("json");
    const upsert = ctx.req.query("upsert") === "true";

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: body.userIds,
        },
      },
      select: {
        avatarId: true,
      },
    });

    if (users.length !== body.userIds.length)
      return ctx.json({ error: "User not found" }, 404);

    try {
      if (upsert) {
        const allUsers = [payload.user, ...body.userIds];

        const chat = await prisma.chat.findFirst({
          where: {
            userIds: {
              hasEvery: allUsers,
            },
          },
        });

        if (chat) return ctx.json(chat);
      }

      let imageId = body.imageId || null;
      if (!imageId) if (users.length === 1) imageId = users[0].avatarId;

      if (!imageId) {
        const avatar = createAvatar(body.name);
        const image = await prisma.attachment.create({
          data: {
            data: avatar,
            type: "IMAGE",
            userId: payload.user,
            name: "avatar",
          },
        });

        imageId = image.id;
      }

      const chat = await prisma.chat.create({
        data: {
          name: body.name,
          imageId: imageId,
          userIds: {
            set: [payload.user, ...body.userIds],
          },
        },
      });

      return ctx.json(chat);
    } catch (e) {
      console.log(e);
      return ctx.json({ error: "Invalid image id" }, 400);
    }
  }
);

export default hono;
