import { User } from "@/types/prisma/models";
import { Link } from "@tanstack/react-router";
import Avatar from "../account/Avatar";

export default function TopArtist({
  user,
  position,
  streams,
}: {
  user: User | undefined;
  position: string;
  streams: number;
}) {
  if (!user) return null;

  return (
    <Link
      className={
        "flex flex-col items-center " + (position !== "🥇" ? "mt-20" : "")
      }
    >
      <div className="relative mb-3">
        <Avatar user={user} width={80} height={80} />
        <p className="absolute bottom-0 w-full text-center text-xl">
          {position}
        </p>
      </div>
      <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
        {user.name}
      </h5>
      <p className="muted">
        {Intl.NumberFormat("en", { notation: "compact" }).format(streams)}{" "}
        streams
      </p>
    </Link>
  );
}
