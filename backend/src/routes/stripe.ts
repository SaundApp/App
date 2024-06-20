import { Hono } from "hono";
import { jwt } from "hono/jwt";
import stripe from "../lib/stripe";

const hono = new Hono();
hono.post(
  "/create",
  jwt({
    secret: process.env.JWT_SECRET!,
  }),
  async (ctx) => {
    const payload = ctx.get("jwtPayload");
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

    return ctx.json({ url: accountLink.url });
  }
);

export default hono;
