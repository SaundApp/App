import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "form-types";
import { Hono } from "hono";
import { jwt, JwtVariables, sign, verify } from "hono/jwt";
import SpotifyWebApi from "spotify-web-api-node";
import { z } from "zod";
import prisma from "../lib/prisma";

const hono = new Hono<{ Variables: JwtVariables }>();

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.APP_URL + "/auth/callback/spotify",
};

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
      400
    );
  }

  const hashedPassword = await Bun.password.hash(body.password);
  const user = await prisma.user.create({
    data: {
      username: body.username,
      name: body.name,
      email: body.email,
      password: hashedPassword,
    },
  });
  const token = await sign(
    {
      user: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    process.env.JWT_SECRET!
  );

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
      404
    );
  }

  const passwordMatch = await Bun.password.verify(body.password, user.password);

  if (!passwordMatch) {
    return ctx.json(
      {
        error: "Password is incorrect",
      },
      400
    );
  }

  const token = await sign(
    {
      user: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    process.env.JWT_SECRET!
  );

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

  return ctx.json({
    ...user,
    password: undefined,
  });
});

hono.get("/login/spotify", async (ctx) => {
  const state = Math.random().toString(36).substring(2, 18);

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
        ].join(" "),
        state,
      }).toString()
  );
});

hono.get("/callback/spotify", async (ctx) => {
  let user;

  if (ctx.req.header("Authorization")) {
    const token = ctx.req.header("Authorization")!.split(" ")[1];
    const payload = await verify(token, process.env.JWT_SECRET!);

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
      400
    );
  }

  try {
    const spotify = new SpotifyWebApi(credentials);
    const res = await spotify.authorizationCodeGrant(code);

    spotify.setAccessToken(res.body.access_token);

    const me = await spotify.getMe();

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
          },
        });
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

    const token = await sign(
      {
        user: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      process.env.JWT_SECRET!
    );

    return ctx.redirect(
      process.env.FRONTEND_URL + "/auth/login?token=" + token
    );
  } catch (error) {
    return ctx.json(
      {
        error: "Invalid code",
      },
      400
    );
  }
});

export default hono;
