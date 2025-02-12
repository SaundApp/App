import {
  NotificationType,
  prisma,
  sendNotification,
} from "@repo/backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import stripe from "../lib/stripe";
import type Stripe from "stripe";

const hono = new Hono();

hono.get("/search", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const query = ctx.req.query("q");
  const friends = ctx.req.query("friends");
  const payload = ctx.get("jwtPayload");

  if (!query) {
    if (!friends) return ctx.json([]);

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

  return ctx.json(results.filter((user) => user.id !== payload.user));
});

hono.get(
  "/:username",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const username = ctx.req.param("username");

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarId: true,
        private: true,
        verified: true,
        spotifyId: true,
        subscribers: {
          select: {
            userId: true,
          },
          where: {
            userId: payload.user,
          },
        },
        subscriptions: {
          select: {
            userId: true,
          },
          where: {
            subscribedToId: payload.user,
          },
        },
        subscriptionSettings: true,
        requestsReceived: {
          where: {
            senderId: payload.user,
          },
        },
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
      subscribers: undefined,
      subscriptions: undefined,
      subscriber: user.subscriptions.length > 0,
      subscribed: user.subscribers.length > 0,
      requestSent: user.requestsReceived.length > 0,
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

    if (!user) {
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

    const self = await prisma.user.findUnique({
      where: {
        id: payload.user,
      },
      select: {
        username: true,
      },
    });

    const following = await prisma.follows.findFirst({
      where: {
        followerId: payload.user,
        followingId: id,
      },
    });

    if (following)
      return ctx.json(
        {
          error: "User already followed",
        },
        400
      );

    if (user.private) {
      try {
        const req = await prisma.followRequest.create({
          data: {
            senderId: payload.user,
            receiverId: id,
          },
        });

        sendNotification(id, NotificationType.FOLLOW_REQUEST, {
          user: self!.username,
          requestId: req.id,
        });

        return ctx.json({
          message: "Request sent",
          request: true,
        });
      } catch (err) {
        return ctx.json(
          {
            error: "Request already sent",
          },
          400
        );
      }
    }

    try {
      await prisma.follows.create({
        data: {
          followerId: payload.user,
          followingId: id,
        },
      });

      sendNotification(id, NotificationType.FOLLOW, {
        user: self!.username,
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

hono.post(
  "/requests/accept",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.query("id");
    const notificationId = ctx.req.query("notificationId");

    if (!id || !notificationId) {
      return ctx.json(
        {
          error: "Invalid request",
        },
        400
      );
    }

    const request = await prisma.followRequest.findUnique({
      where: {
        id,
      },
      include: {
        sender: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!request || request.receiverId !== payload.user) {
      return ctx.json(
        {
          error: "Request not found",
        },
        404
      );
    }

    await prisma.follows.create({
      data: {
        followerId: request.senderId,
        followingId: request.receiverId,
      },
    });

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    await prisma.followRequest.delete({
      where: {
        id,
      },
    });

    return ctx.json({
      message: "Request accepted",
    });
  }
);

hono.delete(
  "/:id/request",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    const request = await prisma.followRequest.findFirst({
      where: {
        senderId: payload.user,
        receiverId: id,
      },
    });

    if (!request) {
      return ctx.json(
        {
          error: "Request not found",
        },
        404
      );
    }

    const req = await prisma.followRequest.delete({
      where: {
        id: request.id,
      },
    });

    if (req.notificationId)
      await prisma.notification.delete({
        where: {
          id: req.notificationId,
        },
      });

    return ctx.json({
      message: "Request removed",
    });
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

hono.get(
  "/:id/posts",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

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
          where: {
            followerId: payload.user,
          },
        },
      },
    });

    if (
      !user ||
      (user.private && !user.followers.length && id !== payload.user)
    ) {
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
  }
);

hono.get(
  "/:id/chats",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const id = ctx.req.param("id");
    const payload = ctx.get("jwtPayload");

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
          where: {
            followerId: payload.user,
          },
        },
      },
    });

    if (
      !user ||
      (user.private && !user.followers.length && id !== payload.user)
    ) {
      return ctx.json([]);
    }

    const chats = await prisma.chat.findMany({
      where: {
        userIds: {
          has: id,
        },
        private: false,
      },
    });

    return ctx.json(chats);
  }
);

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

hono.post(
  "/:id/subscribe",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    if (payload.user === id) {
      return ctx.json(
        {
          error: "Cannot subscribe to yourself",
        },
        400
      );
    }

    const target = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        subscriptionSettings: true,
        stripeId: true,
        verified: true,
        private: true,
        subscribers: {
          where: {
            userId: payload.user,
          },
        },
      },
    });

    if (
      !target ||
      !target.verified ||
      target.private ||
      !target.subscriptionSettings ||
      !target.stripeId
    ) {
      return ctx.json(
        {
          error: "Cannot subscribe to this user",
        },
        404
      );
    }

    if (target.subscribers.length) {
      return ctx.json(
        {
          error: "Already subscribed",
        },
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: { name: true, email: true, stripeCustomerId: true },
    });
    if (!user) {
      return ctx.json(
        {
          error: "User not found",
        },
        404
      );
    }

    let stripeId = user.stripeCustomerId;
    if (!stripeId) {
      stripeId = (
        await stripe.customers.create({
          metadata: {
            user: payload.user,
          },
          name: user.name,
          email: user.email,
        })
      ).id;

      await prisma.user.update({
        where: { id: payload.user },
        data: {
          stripeCustomerId: stripeId,
        },
      });
    }

    let product = await stripe.products
      .search({
        query: `metadata["user"]:"${target.id}"`,
        limit: 1,
      })
      .next()
      .then((it) => it.value as Stripe.Product);

    if (!product)
      product = await stripe.products.create({
        name: `Subscription to ${target.username}`,
        metadata: {
          user: target.id,
        },
      });

    const subscription = await stripe.subscriptions.create({
      customer: stripeId,
      items: [
        {
          price_data: {
            currency: "eur",
            product: product.id,
            recurring: {
              interval: "month",
              interval_count: 1,
            },
            unit_amount_decimal: target.subscriptionSettings.price.toString(),
          },
          quantity: 1,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        user: payload.user,
        target: id,
      },
      transfer_data: {
        amount_percent: 90,
        destination: target.stripeId,
      },
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      {
        customer: stripeId,
      },
      { apiVersion: "2024-09-30.acacia" }
    );

    return ctx.json({
      id: subscription.id,
      customerId: stripeId,
      clientSecret: (
        (subscription.latest_invoice as Stripe.Invoice)
          ?.payment_intent as Stripe.PaymentIntent
      )?.client_secret,
      customerSecret: ephemeralKey.secret,
    });
  }
);

hono.get(
  "/:id/subscribers",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const id = ctx.req.param("id");

    if (payload.user !== id) {
      return ctx.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        subscribers: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarId: true,
              },
            },
          },
        },
      },
    });

    return ctx.json(user?.subscribers.map((s) => s.user) || []);
  }
);

export default hono;
