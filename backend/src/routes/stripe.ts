import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";
import stripe from "../lib/stripe";

const hono = new Hono();
hono.post(
  "/artist/connect",
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
      return ctx.json({ url: "https://dashboard.stripe.com/account/status" });
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

    if (
      event.type !== "customer.subscription.created" &&
      event.type !== "customer.subscription.deleted"
    )
      return ctx.json({ success: true }, 200);

    const metadata = event.data.object.metadata as {
      user: string;
      target: string;
    };

    switch (event.type) {
      case "customer.subscription.created": {
        await prisma.subscription.create({
          data: {
            userId: metadata.user,
            subscribedToId: metadata.target,
            amount:
              (event.data.object.items.data[0].price.unit_amount || 0) / 100,
          },
        });

        break;
      }
      case "customer.subscription.deleted": {
        await prisma.subscription.deleteMany({
          where: {
            userId: metadata.user,
            subscribedToId: metadata.target,
          },
        });

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

hono.post(
  "/client/dashboard",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
    const user = await prisma.user.findUnique({
      where: { id: payload.user },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!user!.stripeCustomerId) {
      return ctx.json({ url: "" });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: user!.stripeCustomerId,
      return_url: process.env.FRONTEND_URL,
    });

    return ctx.json({ url: portal.url });
  }
);

export default hono;
