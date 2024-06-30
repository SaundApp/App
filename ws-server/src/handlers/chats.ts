import { prisma } from "@repo/backend-common";
import { type JwtPayload, verify } from "jsonwebtoken";

export function authenticate(token: string): string | null {
  if (!token) return null;

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return payload.user;
  } catch (e) {
    return null;
  }
}

export async function getChat(id: string) {
  if (!id) return null;

  return await prisma.chat.findUnique({ where: { id } });
}
