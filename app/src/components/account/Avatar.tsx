import { MouseEventHandler } from "react";
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
  onClick?: MouseEventHandler<HTMLImageElement>;
}) {
  return (
    <img
      onClick={onClick}
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
      className="rounded-full"
    />
  );
}
