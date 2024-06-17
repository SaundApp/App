import { Hono } from "hono";
import { spotify } from "../lib/spotify";

const hono = new Hono();

hono.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const type = ctx.req.query("type");

  if (type === "song") {
    const song = await spotify.tracks.get(id);

    return ctx.json(song);
  } else if (type === "album") {
    const album = await spotify.albums.get(id);

    return ctx.json(album);
  } else if (type === "playlist") {
    const playlist = await spotify.playlists.getPlaylist(id);

    return ctx.json(playlist);
  } else return ctx.notFound();
});

export default hono;
