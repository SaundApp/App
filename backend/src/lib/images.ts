import { createCanvas } from "@napi-rs/canvas";
import sharp from "sharp";

function randomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

export function createAvatar(name: string) {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = randomColor();
  ctx.fillRect(0, 0, 200, 200);
  ctx.font = "bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(name[0].toUpperCase(), 100, 100);

  const buffer = canvas.toBuffer("image/webp");

  return buffer;
}

export async function compressImage(buffer: Buffer | ArrayBuffer) {
  return await sharp(buffer)
    .resize(256, 256, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80, progressive: true })
    .webp({ quality: 80 })
    .toBuffer();
}
