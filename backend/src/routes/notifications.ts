import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";

const hono = new Hono();

hono.post(
  "/register",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const { token } = await ctx.req.json();

    await prisma.user.update({
      where: { id: payload.user },
      data: { notificationToken: token },
    });

    return ctx.json({ success: true });
  }
);

export default hono;
