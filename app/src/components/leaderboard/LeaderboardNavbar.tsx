import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function LeaderboardNavbar() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between gap-3 bg-background text-center">
      <Link
        to="/leaderboard/artists"
        className="w-full"
        activeProps={{
          className: "border-b-2 border-b-white font-semibold",
        }}
      >
        {t("leaderboard.artists")}
      </Link>
      <Link
        to="/leaderboard/songs"
        className="w-full"
        activeProps={{
          className: "border-b-2 border-b-white font-semibold",
        }}
      >
        {t("leaderboard.songs")}
      </Link>
    </div>
  );
}
