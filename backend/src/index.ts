import { serve } from "@hono/node-server";
import { sentry } from "@hono/sentry";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { readdirSync } from "node:fs";
import path from "node:path";

export const app = new Hono();

app.use(
  sentry({
    dsn: process.env.SENTRY_DSN!,
    enabled: process.env.NODE_ENV === "production",
  })
);
app.use(
  cors({
    origin: "*",
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "User-Agent",
      "Sentry-Trace",
      "Baggage",
    ],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
    exposeHeaders: ["Content-Length", "Content-Type", "Content-Disposition"],
    maxAge: 600,
  })
);

app.get("/app", (ctx) => {
  return ctx.redirect(process.env.FRONTEND_URL + "/");
});

readdirSync(path.join(__dirname, "routes")).forEach((file) => {
  if (file.endsWith(".ts") || file.endsWith(".js")) {
    import(`./routes/${file}`).then((module) => {
      app.route(`/${file.split(".")[0]}`, module.default);
      console.log(`[Route] /${file.split(".")[0]} loaded`);
    });
  }
});

const port = 8000;
console.log(`[Server] Running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
