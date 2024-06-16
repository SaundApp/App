import { Hono } from "hono";
import prisma from "../lib/prisma";
import { fetchStreams } from "../lib/stats";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

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

hono.post("/posts/create", async (ctx) => {
  const token = ctx.req.header("Authorization");

  if (!token || token.split(" ")[1] !== process.env.ADMIN_KEY) {
    return ctx.json(
      {
        error: "Unauthorized",
      },
      401
    );
  }

  const posts = await prisma.post.findMany();
  const spotify = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID!,
    process.env.SPOTIFY_CLIENT_SECRET!
  );
  let cont = 0;

  for (const post of posts) {
    let streams = 0;
    const album = await spotify.albums.get(post.url.split("/").pop()!);

    for (const track of album.tracks.items) {
      streams += await fetchStreams("song", track.id);
    }

    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        streams,
      },
    });

    cont++;
  }

  return ctx.json(cont);
});

hono.get("/posts/:nationality", async (ctx) => {
  const nationality = ctx.req.param("nationality");

  const posts = await prisma.post.findMany({
    where: {
      streams: {
        gt: 0,
      },
      user: {
        nationality,
      },
    },
    orderBy: {
      streams: "desc",
    },
    select: {
      id: true,
      name: true,
      streams: true,
      image: true,
      url: true,
      type: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarId: true,
        },
      },
    },
    take: 50,
  });

  return ctx.json(posts);
});

export default hono;