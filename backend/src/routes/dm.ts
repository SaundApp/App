import { prisma } from "backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";

const hono = new Hono();

hono.get("/list", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const payload = ctx.get("jwtPayload");

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: payload.user,
          },
        },
        {
          OR: [
            {
              messagesSent: {
                some: {
                  receiverId: payload.user,
                },
              },
            },
            {
              messagesReceived: {
                some: {
                  senderId: payload.user,
                },
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      username: true,
      avatarId: true,
      name: true,
    },
  });

  const chats = await Promise.all(
    users.map(async (user) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            {
              senderId: payload.user,
              receiverId: user.id,
            },
            {
              senderId: user.id,
              receiverId: payload.user,
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const unread = await prisma.message.findFirst({
        where: {
          senderId: user.id,
          receiverId: payload.user,
          read: false,
        },
      });

      return {
        user,
        lastMessage,
        read: !unread,
      };
    })
  );

  return ctx.json(
    chats.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
      );
    })
  );
});

hono.get(
  "/:username",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const username = ctx.req.param("username");
    const payload = ctx.get("jwtPayload");
    let offset = ctx.req.query("offset") || 0;

    if (typeof offset !== "number" || offset < 0) offset = 0;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: payload.user,
            receiver: {
              username,
            },
          },
          {
            sender: {
              username,
            },
            receiverId: payload.user,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: 50,
    });

    await prisma.message.updateMany({
      where: {
        sender: {
          username,
        },
        receiverId: payload.user,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return ctx.json(messages);
  }
);

hono.delete(
  "/:username",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const username = ctx.req.param("username");
    const payload = ctx.get("jwtPayload");

    const result = await prisma.message.deleteMany({
      where: {
        OR: [
          {
            senderId: payload.user,
            receiver: {
              username,
            },
          },
          {
            sender: {
              username,
            },
            receiverId: payload.user,
          },
        ],
      },
    });

    return ctx.json(result);
  }
);

hono.post(
  "/:username/read",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const username = ctx.req.param("username");
    const payload = ctx.get("jwtPayload");

    await prisma.message.updateMany({
      where: {
        sender: {
          username,
        },
        receiverId: payload.user,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return ctx.json({ success: true });
  }
);

export default hono;
