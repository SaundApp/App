import {
  NotificationType,
  prisma,
  sendNotification,
} from "@repo/backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { fetchStreams } from "../lib/stats";
import admin from "../middlewares/admin";

const hono = new Hono();

hono.post("/artists/create", admin, async (ctx) => {
  const users = await prisma.user.findMany({
    where: {
      spotifyId: {
        not: null,
      },
    },
  });

  let cont = 0;

  for (const user of users) {
    const streams = await fetchStreams("artist", user.spotifyId!);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        streams,
      },
    });

    cont++;
  }

  const everyone = await prisma.user.findMany({
    where: {
      notificationTokens: {
        isEmpty: false,
      },
    },
    select: {
      id: true,
    },
  });

  everyone.forEach((user) =>
    sendNotification(user.id, NotificationType.LEADERBOARD, {}),
  );

  return ctx.json(cont);
});

hono.get(
  "/artists",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");

    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: { nationality: true },
    });

    let nationality = user?.nationality?.toUpperCase() || "EN";

    const users = await prisma.user.findMany({
      where: {
        streams: {
          gt: 0,
        },
        nationality,
      },
      orderBy: {
        streams: "desc",
      },
      select: {
        id: true,
        name: true,
        username: true,
        streams: true,
        avatarId: true,
      },
      take: 50,
    });

    return ctx.json(users);
  },
);

export default hono;
