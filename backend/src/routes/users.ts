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
    const payload = ctx.get("jwtPayload");

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
      },
    });

    if (!user) {
      return ctx.json({
        error: "User not found",
      });
    }

    if (user.private && user.id !== payload.user) {
      return ctx.json({
        error: "User is private",
      });
    }

    return ctx.json(user);
  }
);

hono.get("/:id/followers", async (ctx) => {
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

  return ctx.json(followers);
});

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
      return ctx.json({
        error: "User not found",
      });
    }

    const payload = ctx.get("jwtPayload");

    if (payload.user === id) {
      return ctx.json({
        error: "Cannot follow yourself",
      });
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
      return ctx.json({
        error: "User already followed",
      });
    }
  }
);

hono.get("/:id/following", async (ctx) => {
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
});

hono.delete(
  "/:id/unfollow",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

    if (payload.user === id) {
      return ctx.json({
        error: "Cannot unfollow yourself",
      });
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

export default hono;
