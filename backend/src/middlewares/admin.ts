import { createMiddleware } from "hono/factory";

export default createMiddleware(async (ctx, next) => {
  const token = ctx.req.header("Authorization");

  if (!token || token.split(" ")[1] !== process.env.ADMIN_KEY) {
    console.log(
      `[${ctx.req.path}] An unauthorized request was made for an admin route.`
    );
    return ctx.json(
      {
        error: "Unauthorized",
      },
      401
    );
  }

  await next();
});
