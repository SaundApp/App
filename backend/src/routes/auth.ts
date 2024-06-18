import { zValidator } from "@hono/zod-validator";
import { AttachmentType } from "@prisma/client";
import { loginSchema, registerSchema, updateSchema } from "form-types";
import { Hono } from "hono";
import { jwt, JwtVariables, sign, verify } from "hono/jwt";
import SpotifyWebApi from "spotify-web-api-node";
import { createAvatar } from "../lib/avatar";
import prisma from "../lib/prisma";
import { spotify } from "../lib/spotify";

const hono = new Hono<{ Variables: JwtVariables }>();

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.APP_URL + "/auth/callback/spotify",
};

async function generateAvatar(id: string, username: string) {
  const attachment = await prisma.attachment.create({
    data: {
      userId: id,
      type: AttachmentType.IMAGE,
      data: await createAvatar(username),
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

  await generateAvatar(user.id, user.name);

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
          400
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
          400
        );
      }
    }

    return ctx.json({
      success: true,
    });
  }
);

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
    const spotifyClient = new SpotifyWebApi(credentials);
    const res = await spotifyClient.authorizationCodeGrant(code);

    spotifyClient.setAccessToken(res.body.access_token);

    const me = await spotifyClient.getMe();
    const playlists = await spotifyClient.getUserPlaylists();

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

        await generateAvatar(user.id, user.name);
      }
    }

    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        spotifyId: me.body.id,
        nationality: me.body.country,
      },
    });

    for (const playlist of playlists.body.items) {
      if (playlist.owner.id !== me.body.id) continue;
      if (!playlist.public) continue;

      try {
        await spotify.playlists.getPlaylist(playlist.id);
      } catch (error) {
        continue;
      }

      const exists = await prisma.post.findFirst({
        where: {
          spotifyId: playlist.id,
        },
      });

      if (exists) continue;

      await prisma.post.create({
        data: {
          name: playlist.name,
          spotifyId: playlist.id,
          userId: user.id,
          image: playlist.images[0]?.url,
          url: playlist.external_urls.spotify,
          type: "PLAYLIST",
        },
      });
    }

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
