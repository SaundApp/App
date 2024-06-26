import { AttachmentType, prisma } from "backend-common";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { stream } from "hono/streaming";

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
  const buffer = Buffer.from(arrbuf);
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
      type = "image/png";
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

  return ctx.json({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
  });
});

export default hono;
