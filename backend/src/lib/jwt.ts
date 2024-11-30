import { sign } from "hono/jwt";

export async function signToken(userId: string) {
  return await sign(
    {
      user: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
    process.env.JWT_SECRET!,
  );
}
