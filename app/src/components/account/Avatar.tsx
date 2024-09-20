import type { MouseEventHandler } from "react";
import type { PublicUser } from "@/types/prisma";

export default function Avatar({
  user,
  imageId,
  width,
  height,
  onClick,
}: {
  user?: PublicUser;
  imageId?: string;
  width: number;
  height: number;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  const image = (
    <img
      src={
        import.meta.env.VITE_API_URL +
        "/attachments/" +
        (user?.avatarId || imageId)
      }
      alt={user?.username || undefined}
      width={width}
      height={height}
      style={{
        objectFit: "cover",
        width: width,
        height: height,
      }}
      crossOrigin="anonymous"
      className="aspect-square rounded-full"
    />
  );

  if (onClick)
    return (
      <button type="button" onClick={onClick}>
        {image}
      </button>
    );

  return image;
}
