import { Hono } from "hono";
import { jwt } from "hono/jwt";
import type { Stripe } from "stripe";
import prisma from "../lib/prisma";
import stripe from "../lib/stripe";

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

hono.post("/webhook", async (ctx) => {
  const signature = ctx.req.header("stripe-signature");

  try {
    if (!signature) {
      return ctx.json({ error: true }, 400);
    }

    const body = await ctx.req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "customer.subscription.created": {
        console.log(event.data.object.metadata);
        break;
      }
      case "customer.subscription.deleted": {
        console.log(event.data.object.metadata);
        break;
      }
      default:
        break;
    }

    return ctx.json({ success: true }, 200);
  } catch (err) {
    const errorMessage = `⚠️  Webhook signature verification failed. ${
      err instanceof Error ? err.message : "Internal server error"
    }`;

    console.log(errorMessage);
    return ctx.json({ error: true, message: errorMessage }, 400);
  }
});

export default hono;
