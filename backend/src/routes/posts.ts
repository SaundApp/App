import type { Prisma } from "@repo/backend-common";
import {
  NotificationType,
  prisma,
  sendNotification,
} from "@repo/backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { spotify } from "../lib/spotify";
import admin from "../middlewares/admin";

const hono = new Hono();

hono.post("/create", admin, async (ctx) => {
  const users = await prisma.user.findMany({
    where: {
      spotifyId: {
        not: null,
      },
    },
    include: {
      followers: {
        select: {
          followerId: true,
        },
        where: {
          follower: {
            notificationTokens: {
              isEmpty: false,
            },
          },
        },
      },
    },
  });
  let cont = 0;

  for (const user of users) {
    if (cont % 10 == 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    try {
      const artist = await spotify.artists.get(user.spotifyId!);
      const albums = await spotify.artists.albums(
        user.spotifyId!,
        undefined,
        undefined,
        50,
      );

      const recent = albums.items
        .filter(
          (album) =>
            album.album_group === "album" || album.album_group === "single",
        )
        .sort((a, b) => {
          return (
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime()
          );
        })
        .slice(0, 5);

      let artistCont = 0;
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
              url: album.external_urls.spotify,
              type: album.album_type === "album" ? "ALBUM" : "SONG",
              spotifyId: album.id,
              genres: artist.genres,
            },
          });

          artistCont++;
          cont++;
        } catch (err) {}
      }

      if (artistCont > 0) {
        for (const follower of user.followers) {
          sendNotification(follower.followerId, NotificationType.POST, {
            user: user.username,
            count: artistCont.toString(),
          });
        }
      }
    } catch (err) {}
  }

  return ctx.json({ cont });
});

hono.get(
  "/",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    let offset = Number(ctx.req.query("offset") || 0);

    if (isNaN(offset) || offset < 0) offset = 0;

    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      include: {
        following: { select: { followingId: true } },
      },
    });
    if (!user) return ctx.json({ error: "User not found" }, 404);

    const prismaArgs: Prisma.PostFindManyArgs = {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarId: true,
          },
        },
        comments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: 20,
    };

    const posts = await prisma.post.findMany({
      where: {
        NOT: {
          seen: {
            has: user.id,
          },
        },
        OR: [
          {
            user: {
              id: {
                in: user.following.map((user) => user.followingId),
              },
            },
          },
          {
            genres: {
              hasSome: user.genres,
            },
          },
        ],
      },

      ...prismaArgs,
    });

    if (posts.length < 10) {
      const newPosts = await prisma.post.findMany({
        where: {
          NOT: {
            seen: {
              has: user.id,
            },
          },
          id: {
            notIn: posts.map((post) => post.id),
          },
        },
        ...prismaArgs,
        take: 10 - posts.length,
      });

      posts.push(...newPosts);
    }

    let contOld = 0;
    if (posts.length < 10) {
      const newPosts = await prisma.post.findMany({
        where: {
          id: {
            notIn: posts.map((post) => post.id),
          },
        },
        ...prismaArgs,
        take: 10 - posts.length,
      });

      contOld = newPosts.length;
      posts.push(...newPosts);
    }

    if (contOld < 10)
      posts.sort((a, b) => {
        const aIsFollowed = user.following.some(
          (u) => u.followingId === a.userId,
        );
        const bIsFollowed = user.following.some(
          (u) => u.followingId === b.userId,
        );
        const aIsLiked = a.likes.some((u) =>
          user.following.some((f) => f.followingId === u),
        );
        const bIsLiked = b.likes.some((u) =>
          user.following.some((f) => f.followingId === u),
        );
        const aIsUnseen = !a.seen.includes(user.id);
        const bIsUnseen = !b.seen.includes(user.id);

        if (aIsUnseen && !bIsUnseen) return -1;
        if (!aIsUnseen && bIsUnseen) return 1;
        if (aIsFollowed && !bIsFollowed) return -1;
        if (!aIsFollowed && bIsFollowed) return 1;
        if (aIsLiked && !bIsLiked) return -1;
        if (!aIsLiked && bIsLiked) return 1;

        return 0;
      });
    else posts.sort(() => Math.random() - 0.5);

    return ctx.json(
      posts.map((post) => ({
        ...post,
        seen: undefined,
      })),
    );
  },
);

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
        404,
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

    const user = await prisma.user.findUnique({
      where: {
        id: payload.user,
      },
      select: {
        username: true,
      },
    });

    await sendNotification(post.userId, NotificationType.LIKE, {
      post: post.name,
      user: user!.username,
    });

    return ctx.json({
      message: "Post liked",
    });
  },
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
      404,
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
        400,
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
        404,
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
    const mentions = (body.text as string).match(/@(\w*)/g);

    const userDb = await prisma.user.findUnique({
      where: {
        id: payload.user,
      },
    });

    for (const match of mentions || []) {
      const username = match.slice(1);
      const user = await prisma.user.findFirst({
        where: {
          username,
        },
      });

      if (user) {
        sendNotification(user.id, NotificationType.MENTION, {
          post: post.name,
          user: userDb!.username,
          comment: body.text,
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.user,
      },
      select: {
        username: true,
      },
    });

    sendNotification(post.userId, NotificationType.COMMENT, {
      post: post.name,
      user: user!.username,
      comment: body.text,
    });

    return ctx.json(comment);
  },
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
      404,
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
      comments: true,
    },
  });

  if (!post) {
    return ctx.json(
      {
        error: "Post not found",
      },
      404,
    );
  }

  return ctx.json(post);
});

hono.post("/:id/see", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const id = ctx.req.param("id");
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      seen: true,
    },
  });

  if (!post) {
    return ctx.json(
      {
        error: "Post not found",
      },
      404,
    );
  }

  const payload = ctx.get("jwtPayload");

  if (!post.seen.includes(payload.user)) {
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        seen: {
          push: payload.user,
        },
      },
    });
  }

  return ctx.json({
    success: true,
  });
});

export default hono;
