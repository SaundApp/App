import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";

const hono = new Hono();

hono.post("/create", async (ctx) => {
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

  const spotify = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID!,
    process.env.SPOTIFY_CLIENT_SECRET!
  );
  let cont = 0;

  for (const user of users) {
    const albums = await spotify.artists.albums(
      user.spotifyId!,
      undefined,
      undefined,
      50
    );

    const recent = albums.items
      .filter(
        (album) =>
          album.album_group === "album" || album.album_group === "single"
      )
      .sort((a, b) => {
        return (
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
        );
      })
      .slice(0, 5);

    for (const album of recent) {
      try {
        await prisma.post.create({
          data: {
            name: album.name,
            image: album.images[0].url,
            user: {
              connect: {
                id: user.id,
              },
            },
            urls: {
              create: {
                spotify: album.external_urls.spotify,
                amazon: "",
                apple: "",
              },
            },
            type: album.album_type === "album" ? "ALBUM" : "SONG",
          },
        });

        cont++;
      } catch (err) {}
    }
  }

  return ctx.json({ cont });
});

hono.get("/", async (ctx) => {
  let offset = ctx.req.query("offset") || 0;

  if (typeof offset != "number" || offset < 0) offset = 0;

  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          name: true,
          username: true,
          avatarId: true,
        },
      },
      urls: true,
      comments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
    take: 10,
  });

  return ctx.json(posts);
});

hono.post(
  "/:id/like",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return ctx.json(
        {
          error: "Post not found",
        },
        404
      );
    }

    const payload = ctx.get("jwtPayload");

    if (post.likes.includes(payload.user)) {
      await prisma.post.update({
        where: {
          id,
        },
        data: {
          likes: {
            set: post.likes.filter((like) => like !== payload.user),
          },
        },
      });

      return ctx.json({
        message: "Post unliked",
      });
    }

    await prisma.post.update({
      where: {
        id,
      },
      data: {
        likes: {
          push: payload.user,
        },
      },
    });

    return ctx.json({
      message: "Post liked",
    });
  }
);

hono.get("/:id/likes", async (ctx) => {
  const id = ctx.req.param("id");
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    return ctx.json(
      {
        error: "Post not found",
      },
      404
    );
  }

  const likes = [];

  for (const user of post.likes) {
    const userDb = await prisma.user.findUnique({
      where: {
        id: user,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarId: true,
      },
    });

    likes.push(userDb);
  }

  return ctx.json(likes);
});

hono.post(
  "/:id/comment",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const body = await ctx.req.json();

    if (!body.text || typeof body.text !== "string") {
      return ctx.json(
        {
          error: "Text is required",
        },
        400
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return ctx.json(
        {
          error: "Post not found",
        },
        404
      );
    }

    const payload = ctx.get("jwtPayload");
    const comment = await prisma.comment.create({
      data: {
        text: body.text,
        user: {
          connect: {
            id: payload.user,
          },
        },
        post: {
          connect: {
            id,
          },
        },
      },
    });

    return ctx.json(comment);
  }
);

hono.get("/:id/comments", async (ctx) => {
  const id = ctx.req.param("id");
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    return ctx.json(
      {
        error: "Post not found",
      },
      404
    );
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId: id,
    },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          avatarId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ctx.json(comments);
});

hono.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          avatarId: true,
        },
      },
      urls: true,
      comments: true,
    },
  });

  if (!post) {
    return ctx.json(
      {
        error: "Post not found",
      },
      404
    );
  }

  return ctx.json(post);
});

export default hono;
