import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Hono } from "hono";

const hono = new Hono();

hono.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const type = ctx.req.query("type");
  const spotify = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID!,
    process.env.SPOTIFY_CLIENT_SECRET!
  );

  if (type === "song") {
    const song = await spotify.tracks.get(id);

    return ctx.json(song);
  } else if (type === "album") {
    const album = await spotify.albums.get(id);

    return ctx.json(album);
  } else return ctx.notFound();
});

export default hono;
