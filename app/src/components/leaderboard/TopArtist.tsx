import type { PublicUser } from "@/types/prisma";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import Avatar from "../account/Avatar";

export default function TopArtist({
  user,
  position,
  streams,
}: {
  user: PublicUser | undefined;
  position: string;
  streams: number;
}) {
  const { t } = useTranslation();
  if (!user) return null;

  return (
    <Link
      to={`/account/${user.username}`}
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
        {t("leaderboard.streams")}
      </p>
    </Link>
  );
}
