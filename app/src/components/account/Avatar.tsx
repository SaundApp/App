import { User } from "@/types/prisma/models";

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
  onClick?: () => void;
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
