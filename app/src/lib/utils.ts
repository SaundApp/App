import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getDominantColor(image: HTMLImageElement) {
  await new Promise((resolve) => {
    if (image.complete) {
      return resolve(null);
    }

    image.addEventListener("load", function () {
      resolve(null);
    });
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return [255, 255, 255];
  }

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);

  const data = context.getImageData(0, 0, 1, 1).data;
  
  return [data[0], data[1], data[2]];
}
