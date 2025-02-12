import { zValidator } from "@hono/zod-validator";
import { compareSync, hashSync } from "@node-rs/bcrypt";
import {
  AttachmentType,
  prisma,
  sendForgotPassword,
} from "@repo/backend-common";
import {
  loginSchema,
  registerSchema,
  updateSchema,
  updateSubscriptionSchema,
} from "@repo/form-types";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { JwtVariables, jwt, verify } from "hono/jwt";
import SpotifyWebApi from "spotify-web-api-node";
import { isLanguageSupported } from "../../../backend-common/src/translations";
import { createAvatar } from "../lib/images";
import { signToken } from "../lib/jwt";
import { spotifyCredentials, syncUser } from "../lib/spotify";
import { createId } from "@paralleldrive/cuid2";
import { forgotPasswordSchema, resetPasswordSchema } from "@repo/form-types";

const hono = new Hono<{ Variables: JwtVariables }>();

async function generateAvatar(id: string, username: string) {
  const attachment = await prisma.attachment.create({
    data: {
      userId: id,
      type: AttachmentType.IMAGE,
      data: createAvatar(username),
      name: "avatar",
    },
  });

  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      avatarId: attachment.id,
    },
  });
}

hono.post("/register", zValidator("json", registerSchema), async (ctx) => {
  const body = ctx.req.valid("json");
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: {
            equals: body.username,
            mode: "insensitive",
          },
        },
        {
          email: {
            equals: body.email,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  if (existing) {
    return ctx.json(
      {
        error: "User already exists",
      },
      400,
    );
  }

  const hashedPassword = hashSync(body.password);
  const user = await prisma.user.create({
    data: {
      username: body.username,
      name: body.name,
      email: body.email,
      password: hashedPassword,
      notificationSettings: {},
    },
  });

  await generateAvatar(user.id, user.name || user.username);

  const token = await signToken(user.id);

  return ctx.json({
    ...user,
    token,
    password: undefined,
  });
});

hono.post("/login", zValidator("json", loginSchema), async (ctx) => {
  const body = ctx.req.valid("json");
  const user = await prisma.user.findUnique({
    where: {
      username: body.username,
    },
  });

  if (!user || !user.password) {
    return ctx.json(
      {
        error: "User not found",
      },
      404,
    );
  }

  const passwordMatch = compareSync(body.password, user.password);

  if (!passwordMatch) {
    return ctx.json(
      {
        error: "Password is incorrect",
      },
      400,
    );
  }

  const token = await signToken(user.id);

  return ctx.json({
    ...user,
    token,
    password: undefined,
  });
});

hono.get("/me", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const payload = ctx.get("jwtPayload");
  const user = await prisma.user.findUnique({
    where: {
      id: payload.user,
    },
    include: {
      following: true,
    },
  });

  let token;

  if (user && payload.exp - Date.now() / 1000 < 60 * 60 * 24 * 15) {
    token = await signToken(user.id);
  }

  return ctx.json({
    ...user,
    token,
    password: undefined,
  });
});

hono.patch(
  "/me/update",
  jwt({ secret: process.env.JWT_SECRET! }),
  zValidator("json", updateSchema),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const body = ctx.req.valid("json");

    if (body.avatar) {
      const attachment = await prisma.attachment.findFirst({
        where: {
          userId: payload.user,
          id: body.avatar,
        },
      });

      if (!attachment) {
        return ctx.json({
          error: "Attachment not found",
        });
      }

      await prisma.user.update({
        where: {
          id: payload.user,
        },
        data: {
          avatarId: attachment.id,
        },
      });
    }

    if (body.name) {
      await prisma.user.update({
        where: {
          id: payload.user,
        },
        data: {
          name: body.name,
        },
      });
    }

    if (body.username) {
      try {
        await prisma.user.update({
          where: {
            id: payload.user,
          },
          data: {
            username: body.username,
          },
        });
      } catch (error) {
        return ctx.json(
          {
            error: "Username already exists",
            t: "account.username_exists",
          },
          400,
        );
      }
    }

    if (body.bio) {
      await prisma.user.update({
        where: {
          id: payload.user,
        },
        data: {
          bio: body.bio,
        },
      });
    }

    if (body.email) {
      try {
        await prisma.user.update({
          where: {
            id: payload.user,
          },
          data: {
            email: body.email,
          },
        });
      } catch (error) {
        return ctx.json(
          {
            error: "Email already exists",
            t: "account.email_exists",
          },
          400,
        );
      }
    }

    if (body.private !== undefined) {
      await prisma.user.update({
        where: {
          id: payload.user,
        },
        data: {
          private: body.private,
        },
      });
    }

    return ctx.json({
      success: true,
    });
  },
);

hono.patch(
  "/me/update-subscription",
  jwt({ secret: process.env.JWT_SECRET! }),
  zValidator("json", updateSubscriptionSchema),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const body = ctx.req.valid("json");

    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: { verified: true },
    });

    if (!user?.verified) {
      return ctx.json(
        {
          error: "User not verified",
          t: "account.not_verified",
        },
        400,
      );
    }

    const newBody = {
      price: body.price * 100,
      perks: body.perks.filter((perk) => perk !== ""),
    };

    await prisma.user.update({
      where: {
        id: payload.user,
      },
      data: {
        subscriptionSettings: newBody,
      },
    });

    return ctx.json({
      success: true,
    });
  },
);

hono.get("/login/spotify", async (ctx) => {
  const token = ctx.req.query("token");
  const state = Math.random().toString(36).substring(2, 18);

  if (token) setCookie(ctx, "spotify_token", token);

  return ctx.redirect(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        redirect_uri: process.env.APP_URL! + "/auth/callback/spotify",
        scope: [
          "playlist-read-private",
          "playlist-read-collaborative",
          "user-follow-modify",
          "user-follow-read",
          "user-top-read",
          "user-read-recently-played",
          "user-read-email",
          "user-read-private",
        ].join(" "),
        state,
      }).toString(),
  );
});

hono.get("/callback/spotify", async (ctx) => {
  const token = getCookie(ctx, "spotify_token");
  let user;

  if (token) {
    const payload = await verify(token, process.env.JWT_SECRET!);

    deleteCookie(ctx, "spotify_token");

    if (payload && payload.user)
      user = await prisma.user.findUnique({
        where: {
          id: payload.user as string,
        },
      });
  }

  const code = ctx.req.query("code");

  if (!code) {
    return ctx.json(
      {
        error: "No code provided",
      },
      400,
    );
  }

  try {
    const spotifyClient = new SpotifyWebApi(spotifyCredentials);
    const res = await spotifyClient.authorizationCodeGrant(code);

    spotifyClient.setAccessToken(res.body.access_token);

    const me = await spotifyClient.getMe();

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email: me.body.email,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: me.body.email,
            name: me.body.display_name || "Unknown",
            username: me.body.id,
            notificationSettings: {},
          },
        });

        await generateAvatar(user.id, user.name || user.username);
      }
    }

    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        spotifyId: me.body.id,
      },
    });

    await prisma.spotifyToken.upsert({
      where: {
        userId: user.id,
      },
      create: {
        accessToken: res.body.access_token,
        refreshToken: res.body.refresh_token,
        expiration: new Date(Date.now() + res.body.expires_in * 1000),
        userId: user.id,
      },
      update: {
        accessToken: res.body.access_token,
        refreshToken: res.body.refresh_token,
        expiration: new Date(Date.now() + res.body.expires_in * 1000),
      },
    });

    await syncUser(user);

    const token = await signToken(user.id);

    return ctx.redirect(
      process.env.FRONTEND_URL + "/auth/login?token=" + token,
    );
  } catch (error) {
    console.log(error);
    return ctx.json(
      {
        error: "Invalid code",
      },
      400,
    );
  }
});

hono.post(
  "/sync/spotify",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const user = await prisma.user.findUnique({
      where: {
        id: payload.user,
      },
    });

    if (!user) {
      return ctx.json(
        {
          error: "User not found",
        },
        404,
      );
    }

    await syncUser(user);

    return ctx.json({
      success: true,
    });
  },
);

hono.post(
  "/spotify/unlink",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");

    await prisma.user.update({
      where: {
        id: payload.user,
      },
      data: {
        spotifyId: null,
      },
    });

    await prisma.post.deleteMany({
      where: {
        userId: payload.user,
      },
    });

    return ctx.json({
      success: true,
    });
  },
);

hono.get("/accounts", async (ctx) => {
  const tokens = ctx.req.query("tokens") || "";
  const items = tokens.split(",");

  const currentToken = ctx.req.header("Authorization")?.split(" ")[1];
  if (currentToken && !items.includes(currentToken)) items.push(currentToken);

  const users = [];
  for (const item of items) {
    try {
      const payload = await verify(item, process.env.JWT_SECRET!);
      if (payload?.user) {
        const user = await prisma.user.findUnique({
          where: {
            id: payload.user as string,
          },
          select: {
            id: true,
            username: true,
            avatarId: true,
            name: true,
          },
        });

        if (user) {
          users.push({
            ...user,
            token: item,
          });
        }
      }
    } catch (err) {}
  }

  return ctx.json(users);
});

hono.patch(
  "/me/language",
  jwt({ secret: process.env.JWT_SECRET! }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const body = await ctx.req.json();

    if (!body.language || !isLanguageSupported(body.language))
      return ctx.json({ error: "Invalid language" }, 400);

    await prisma.user.update({
      where: {
        id: payload.user,
      },
      data: {
        language: body.language,
      },
    });

    return ctx.json({
      success: true,
    });
  },
);

hono.post(
  "/password/forgot",
  zValidator("json", forgotPasswordSchema),
  async (ctx) => {
    const body = ctx.req.valid("json");

    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
      select: {
        email: true,
        language: true,
        id: true,
      },
    });

    if (!user) return ctx.json({ success: true });

    const token = createId();

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token },
    });

    sendForgotPassword(user.email, token, user.language);

    return ctx.json({ success: true });
  },
);

hono.post(
  "/password/reset",
  zValidator("json", resetPasswordSchema),
  async (ctx) => {
    const body = ctx.req.valid("json");
    const user = await prisma.user.findFirst({
      where: {
        resetToken: body.token,
        email: body.email,
      },
    });

    if (!user) return ctx.json({ error: "Invalid token" }, 400);

    const hashedPassword = hashSync(body.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    return ctx.json({ success: true });
  },
);

export default hono;
