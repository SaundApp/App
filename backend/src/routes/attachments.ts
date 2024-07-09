import { AttachmentType, prisma } from "@repo/backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { stream } from "hono/streaming";
import { compressImage } from "../lib/images";
import admin from "../middlewares/admin";

const hono = new Hono();

hono.post("/upload", jwt({ secret: process.env.JWT_SECRET! }), async (ctx) => {
  const payload = ctx.get("jwtPayload");
  const body = await ctx.req.parseBody();
  const file = body.file;
  const type = body.type;

  if (
    !type ||
    typeof type !== "string" ||
    !["image", "audio", "video"].includes(type.toLowerCase())
  )
    return ctx.json({ error: "Invalid type" }, 400);
  if (!file || typeof file === "string")
    return ctx.json({ error: "Invalid file" }, 400);
  if (file.size > 1024 * 1024 * 10)
    return ctx.json({ error: "File too large" }, 400);

  const arrbuf = await file.arrayBuffer();
  let buffer;

  if (type.toLowerCase() === "image") buffer = await compressImage(arrbuf);
  else buffer = Buffer.from(arrbuf);

  const existing = await prisma.attachment.findFirst({
    where: {
      data: buffer,
      userId: payload.user,
    },
  });

  if (existing)
    return ctx.json({ success: true, id: existing.id, cache: true });

  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      data: buffer,
      user: { connect: { id: payload.user } },
      type: type.toUpperCase() as AttachmentType,
    },
  });

  return ctx.json({ success: true, id: attachment.id });
});

hono.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");

  if (!id || typeof id !== "string")
    return ctx.json({ error: "Invalid ID" }, 400);

  const attachment = await prisma.attachment.findUnique({
    where: { id },
  });

  if (!attachment) return ctx.json({ error: "Attachment not found" }, 404);

  let type;

  switch (attachment.type) {
    case AttachmentType.IMAGE:
      type = "image/webp";
      break;
    case AttachmentType.AUDIO:
      type = "audio/wav";
      break;
    case AttachmentType.VIDEO:
      type = "video/mp4";
      break;
  }

  ctx.header("Content-Type", type);
  ctx.header("Content-Length", attachment.data.length.toString());
  ctx.header("Content-Disposition", `inline; filename="${attachment.name}"`);
  ctx.header("Cache-Control", "public, max-age=604800, immutable");

  return stream(ctx, async (s) => {
    const buffer = attachment.data;
    await s.write(buffer);
  });
});

hono.get("/:id/metadata", async (ctx) => {
  const id = ctx.req.param("id");

  if (!id || typeof id !== "string")
    return ctx.json({ error: "Invalid ID" }, 400);

  const attachment = await prisma.attachment.findUnique({
    where: { id },
  });

  if (!attachment) return ctx.json({ error: "Attachment not found" }, 404);

  ctx.header("Cache-Control", "public, max-age=604800, immutable");

  return ctx.json({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
  });
});

hono.post("/cleanup", admin, async (ctx) => {
  const attachments = await prisma.attachment.findMany();
  const toDelete = [];

  for (const attachment of attachments) {
    let used: unknown = await prisma.message.findFirst({
      where: {
        text: {
          contains: attachment.id,
        },
      },
    });

    if (!used) {
      used = await prisma.user.findFirst({
        where: {
          avatarId: attachment.id,
        },
      });
    }

    if (!used) {
      used = await prisma.chat.findFirst({
        where: {
          imageId: attachment.id,
        },
      });
    }

    if (!used) {
      toDelete.push(
        prisma.attachment.delete({
          where: {
            id: attachment.id,
          },
        })
      );
    }
  }

  await prisma.$transaction(toDelete);

  console.log(
    `[Attachments] Cleaned up ${toDelete.length} attachments out of ${attachments.length}`
  );
  return ctx.json(toDelete.length);
});

export default hono;
