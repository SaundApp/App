import { Hono } from "hono";
import prisma from "../lib/prisma";
import { fetchStreams } from "../lib/stats";

const hono = new Hono();

hono.post("/artists/create", async (ctx) => {
  const token = ctx.req.header("Authorization");

  if (!token || token.split(" ")[1] !== process.env.ADMIN_KEY) {
    return ctx.json(
      {
        error: "Unauthorized",
      },
      401
    );
  }

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

  return ctx.json(cont);
});

hono.get("/artists/:nationality", async (ctx) => {
  const nationality = ctx.req.param("nationality");

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
});

export default hono;