import Jimp from "jimp";

function randomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

export async function createAvatar(name: string) {
  const width = 200;
  const height = 200;
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
  const avatar = new Jimp(width, height, randomColor());

  avatar.print(
    font,
    0,
    0,
    {
      text: name[0].toUpperCase(),
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    width,
    height
  );

  const buffer = await avatar.getBufferAsync(Jimp.MIME_PNG);

  return buffer;
}
