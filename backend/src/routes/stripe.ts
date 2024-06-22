import { Hono } from "hono";
import { jwt } from "hono/jwt";
import prisma from "../lib/prisma";
import stripe from "../lib/stripe";
import admin from "../middlewares/admin";

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
            payout: {
              create: {
                amount:
                  (event.data.object.items.data[0].price.unit_amount || 0) /
                  100,
                userId: metadata.target,
              },
            },
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

hono.post("/payout", admin, async (ctx) => {
  const payouts = await prisma.payout.findMany({
    where: {
      paid: false,
    },
    include: {
      user: {
        select: {
          stripeId: true,
          username: true,
        },
      },
    },
  });

  let total: {
    stripeId: string;
    username: string;
    amount: number;
    payouts: string[];
  }[] = [];

  payouts.forEach((payout) => {
    const user = total.find((u) => u.stripeId === payout.user.stripeId);
    if (user) {
      user.amount += payout.amount;
      user.payouts.push(payout.id);
    } else {
      total.push({
        stripeId: payout.user.stripeId!,
        username: payout.user.username,
        amount: payout.amount,
        payouts: [payout.id],
      });
    }
  });

  total = total.filter((user) => user.amount > 0);

  for (const user of total) {
    await stripe.transfers.create({
      amount: user.amount * 100,
      currency: "eur",
      destination: user.stripeId,
      description: `Payout for ${user.payouts.length} subscriptions for ${user.username}`,
    });

    await prisma.payout.updateMany({
      where: {
        id: {
          in: user.payouts,
        },
      },
      data: {
        paid: true,
      },
    });
  }

  return ctx.json({ success: true, count: total.length });
});

export default hono;
