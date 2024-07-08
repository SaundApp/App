import { prisma } from "@repo/backend-common";
import type { Market } from "@spotify/web-api-ts-sdk";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { spotify } from "../lib/spotify";

const hono = new Hono();

hono.get("/:id", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const id = ctx.req.param("id");
  const type = ctx.req.query("type");
  const payload = ctx.get("jwtPayload");

  const user = await prisma.user.findUnique({
    where: { id: payload.user },
  });

  const market = (user?.nationality as Market) || undefined;

  try {
    if (type === "song") {
      const song = await spotify.tracks.get(id, market);

      return ctx.json(song);
    } else if (type === "album") {
      const album = await spotify.albums.get(id, market);

      return ctx.json(album);
    } else if (type === "playlist") {
      const playlist = await spotify.playlists.getPlaylist(id, market);

      return ctx.json(playlist);
    } else return ctx.notFound();
  } catch (err) {
    console.warn(`[Spotify] ${type} ${id} not found.`);
    return ctx.notFound();
  }
});

export default hono;
