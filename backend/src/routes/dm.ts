import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { jwt, verify } from "hono/jwt";
import { upgradeWebSocket } from "..";
import { NotificationType, sendNotification } from "../lib/notifications";
import prisma from "../lib/prisma";

const hono = new Hono();

hono.get(
  "/:username/ws",
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
        const raw = ws.raw as ServerWebSocket;

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

          raw.publish(`${target!.id}:${payload.user}`, command);
          raw.send(command);

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

            raw.publish(`${target!.id}:${payload.user}`, command);
            raw.send(command);
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

          raw.publish(
            `${target!.id}:${payload.user}`,
            "+" + JSON.stringify(result)
          );
          raw.send("+" + JSON.stringify(result));

          return;
        }

        const result = await prisma.message.create({
          data: {
            text: message,
            senderId: payload.user,
            receiverId: target!.id,
          },
        });

        raw.publish(
          `${target!.id}:${payload.user}`,
          "+" + JSON.stringify(result)
        );
        raw.send("+" + JSON.stringify(result));
      },
      async onOpen(_, ws) {
        console.log(`[WS] ${payload.user} connected to ${username}`);

        const raw = ws.raw as ServerWebSocket;

        if (!target) {
          ws.send("error:User not found");
          ws.close();
          return;
        }

        raw.subscribe(`${payload.user}:${target.id}`);
      },
      async onClose(_, ws) {
        const raw = ws.raw as ServerWebSocket;

        raw.unsubscribe(`${payload.user}:${target!.id}`);
        console.log(`[WS] ${payload.user} disconnected from ${username}`);
      },
    };
  })
);

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
