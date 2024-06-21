import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";

const hono = new Hono();

hono.get("/search", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const query = ctx.req.query("q");
  const friends = ctx.req.query("friends");

  if (!query) {
    if (!friends) return ctx.json([]);

    const payload = ctx.get("jwtPayload");
    const results = await prisma.user.findMany({
      where: {
        OR: [
          {
            following: {
              some: {
                followingId: payload.user,
              },
            },
          },
          {
            followers: {
              some: {
                followerId: payload.user,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarId: true,
      },

      take: 10,
    });

    if (results.length < 10) {
      const remaining = 10 - results.length;
      const more = await prisma.user.findMany({
        where: {
          NOT: {
            id: {
              in: results.map((user) => user.id),
            },
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          avatarId: true,
        },
        take: remaining,
      });

      results.push(...more);
    }

    return ctx.json(results.filter((user) => user.id !== payload.user));
  }

  const results = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: query.toLowerCase(),
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatarId: true,
    },
    take: 10,
  });

  return ctx.json(results);
});

hono.get(
  "/:username",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const username = ctx.req.param("username");

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarId: true,
        private: true,
        spotifyId: true,
      },
    });

    if (!user) {
      return ctx.json({
        error: "User not found",
      });
    }

    const followers = await prisma.user.count({
      where: {
        following: {
          some: {
            followingId: user.id,
          },
        },
      },
    });

    const following = await prisma.user.count({
      where: {
        followers: {
          some: {
            followerId: user.id,
          },
        },
      },
    });

    const posts = await prisma.post.count({
      where: {
        userId: user.id,
      },
    });

    return ctx.json({
      ...user,
      posts,
      followers,
      following,
      spotifyId: undefined,
    });
  }
);

hono.get(
  "/:id/followers",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        private: true,
      },
    });

    if (!user) {
      return ctx.json(
        {
          error: "User not found",
        },
        404
      );
    }

    const followers = await prisma.user.findMany({
      where: {
        following: {
          some: {
            followingId: id,
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarId: true,
      },
    });

    if (
      user.private &&
      !followers.some((f) => f.id === payload.user) &&
      id !== payload.user
    ) {
      return ctx.json([]);
    }

    return ctx.json(followers);
  }
);

hono.post(
  "/:id/follow",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        private: true,
      },
    });

    if (!user || user.private) {
      return ctx.json(
        {
          error: "User not found",
        },
        404
      );
    }

    const payload = ctx.get("jwtPayload");

    if (payload.user === id) {
      return ctx.json(
        {
          error: "Cannot follow yourself",
        },
        400
      );
    }

    try {
      await prisma.follows.create({
        data: {
          followerId: payload.user,
          followingId: id,
        },
      });

      return ctx.json({
        message: "User followed",
      });
    } catch (e) {
      return ctx.json(
        {
          error: "User already followed",
        },
        400
      );
    }
  }
);

hono.get(
  "/:id/following",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        private: true,
        followers: {
          select: {
            followerId: true,
          },
        },
      },
    });

    if (!user) {
      return ctx.json(
        {
          error: "User not found",
        },
        404
      );
    }

    if (
      user.private &&
      !user.followers.some((f) => f.followerId === payload.user) &&
      id !== payload.user
    ) {
      return ctx.json([]);
    }

    const following = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: id,
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarId: true,
      },
    });

    return ctx.json(following);
  }
);

hono.delete(
  "/:id/unfollow",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

    if (payload.user === id) {
      return ctx.json(
        {
          error: "Cannot unfollow yourself",
        },
        400
      );
    }

    await prisma.follows.deleteMany({
      where: {
        followerId: payload.user,
        followingId: id,
      },
    });

    return ctx.json({
      message: "User unfollowed",
    });
  }
);

hono.delete(
  "/:id/follower",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

    await prisma.follows.deleteMany({
      where: {
        followerId: id,
        followingId: payload.user,
      },
    });

    return ctx.json({
      message: "Follower removed",
    });
  }
);

hono.get("/:id/posts", async (ctx) => {
  const id = ctx.req.param("id");

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      private: true,
    },
  });

  if (!user || user.private) {
    return ctx.json([]);
  }

  const posts = await prisma.post.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ctx.json(posts);
});

hono.get(
  "/:id/listeners",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        private: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        listeners: {
          where: {
            listener: {
              private: false,
            },
          },
          select: {
            listener: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarId: true,
              },
            },
          },
          orderBy: {
            count: "desc",
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return ctx.json(
        {
          error: "User not found",
        },
        404
      );
    }

    if (
      user.private &&
      !user.followers.some((f) => f.followerId === payload.user) &&
      id !== payload.user
    ) {
      return ctx.json([]);
    }

    return ctx.json(user.listeners.map((l) => l.listener));
  }
);

export default hono;
