import { User } from "@/types/prisma/models";
import { MouseEventHandler } from "react";

export default function Avatar({
  user,
  imageId,
  width,
  height,
  onClick,
}: {
  user?: User;
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
      alt={user?.username}
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
