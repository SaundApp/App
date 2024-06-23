import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";
import type { Notification } from "@prisma/client";

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

export default hono;
