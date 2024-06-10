import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ColorThief from "colorthief";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getDominantColor(image: HTMLImageElement) {
  const color = new ColorThief();

  if (image.complete) {
    return color.getColor(image);
  } else {
    return new Promise((resolve) => {
      image.addEventListener("load", function () {
        resolve(color.getColor(image));
      });
    });
  }
}
