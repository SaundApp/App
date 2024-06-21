import { Hono } from "hono";
import { jwt } from "hono/jwt";
import stripe from "../lib/stripe";
import prisma from "../lib/prisma";

const hono = new Hono();
hono.post(
  "/connect",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: {
        stripeId: true,
      },
    });

    if (user!.stripeId) {
      return ctx.json({ url: "" });
    }

    const account = await stripe.accounts.create({
      metadata: {
        user: payload.user,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: process.env.FRONTEND_URL,
      return_url: process.env.FRONTEND_URL,
      type: "account_onboarding",
      collection_options: {
        fields: "eventually_due",
      },
    });

    await prisma.user.update({
      where: { id: payload.user },
      data: {
        stripeId: account.id,
      },
    });

    console.log(accountLink.url);
    return ctx.json({ url: accountLink.url });
  }
);

export default hono;
