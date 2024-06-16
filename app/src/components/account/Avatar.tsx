import { User } from "@/types/prisma/models";

export default function Avatar({
  user,
  imageId,
  width,
  height,
}: {
  user?: User;
  imageId?: string;
  width: number;
  height: number;
}) {
  return (
    <img
      src={
        import.meta.env.VITE_API_URL +
        "/attachments/" +
        (user?.avatarId || imageId)
      }
      alt={user?.username}
      width={width}
      height={height}
      className="rounded-full"
    />
  );
}
