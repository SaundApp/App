import "dotenv/config";
import { readdirSync } from "fs";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import path from "path";

const { upgradeWebSocket, websocket } = createBunWebSocket();

export const app = new Hono();
export { upgradeWebSocket };

app.use(logger());
app.use(prettyJSON());
app.use(
  cors({
    origin: "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 600,
    credentials: true,
  })
);

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

Bun.serve({
  fetch: app.fetch,
  port,
  websocket,
});
