import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function LeaderboardNavbar() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center gap-3 bg-background p-3">
      <Link
        to="/leaderboard/artists"
        activeProps={{
          className: "underline underline-offset-8 decoration-2 font-semibold",
        }}
      >
        {t("leaderboard.artists")}
      </Link>
      <Link
        to="/leaderboard/songs"
        activeProps={{
          className: "underline underline-offset-8 decoration-2 font-semibold",
        }}
      >
        {t("leaderboard.songs")}
      </Link>
    </div>
  );
}
