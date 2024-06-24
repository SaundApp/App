import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";
import type { Notification } from "@prisma/client";
import { notificationSettingsSchema } from "form-types";
import { zValidator } from "@hono/zod-validator";

const hono = new Hono();

hono.post(
  "/register",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const { token } = await ctx.req.json();

    await prisma.user.update({
      where: { id: payload.user },
      data: { notificationToken: token },
    });

    return ctx.json({ success: true });
  }
);

hono.get("/", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const payload = ctx.get("jwtPayload");

  const notifications = await prisma.notification.findMany({
    where: {
      userId: payload.user,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const updated: (Notification & {
    involvedUserData: {
      id: string;
      name: string;
      username: string;
      avatarId: string | null;
    } | null;
  })[] = await Promise.all(
    notifications.map(async (notification) => {
      if (notification.involvedUser) {
        const user = await prisma.user.findUnique({
          where: { id: notification.involvedUser },
          select: {
            id: true,
            name: true,
            username: true,
            avatarId: true,
          },
        });

        return { ...notification, involvedUserData: user };
      }

      return { ...notification, involvedUserData: null };
    })
  );

  return ctx.json(updated);
});

hono.patch(
  "/settings",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  zValidator("json", notificationSettingsSchema),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const body = ctx.req.valid("json");

    console.log(body)

    await prisma.user.update({
      where: { id: payload.user },
      data: {
        notificationSettings: {
          update: {
            ...body,
          },
        },
      },
    });

    return ctx.json({ success: true });
  }
);

hono.post(
  "/mute/:id",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: {
        notificationSettings: true,
      },
    });

    if (!user) return ctx.json({ error: "User not found" }, 404);

    if (!user.notificationSettings.mutedChats.includes(id))
      await prisma.user.update({
        where: { id: payload.user },
        data: {
          notificationSettings: {
            update: {
              mutedChats: {
                push: id,
              },
            },
          },
        },
      });

    return ctx.json({ success: true });
  }
);

hono.delete(
  "/mute/:id",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: {
        notificationSettings: true,
      },
    });

    if (!user) return ctx.json({ error: "User not found" }, 404);

    if (user.notificationSettings.mutedChats.includes(id))
      await prisma.user.update({
        where: { id: payload.user },
        data: {
          notificationSettings: {
            update: {
              mutedChats: {
                set: user.notificationSettings.mutedChats.filter(
                  (chat) => chat !== id
                ),
              },
            },
          },
        },
      });

    return ctx.json({ success: true });
  }
);

hono.get("/mute", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const payload = ctx.get("jwtPayload");

  const user = await prisma.user.findUnique({
    where: { id: payload.user },
    select: {
      notificationSettings: true,
    },
  });

  return ctx.json(user?.notificationSettings.mutedChats ?? []);
});

export default hono;
