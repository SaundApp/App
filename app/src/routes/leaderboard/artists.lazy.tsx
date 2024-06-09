import Artist from "@/components/leaderboard/Artist";
import LeaderboardNavbar from "@/components/leaderboard/LeaderboardNavbar";
import TopArtist from "@/components/leaderboard/TopArtist";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/leaderboard/artists")({
  component: Artists,
});

function Artists() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <LeaderboardNavbar />

      <h1>
        {t("leaderboard.top")} {t("leaderboard.artists")}
      </h1>

      <div className="flex flex-row justify-between">
        <TopArtist
          user={{
            name: "Tony Boy",
            username: "tonyboy",
            avatar:
              "https://i.scdn.co/image/ab6761610000101f27fcfd9ff73fd86aabf11b54",
          }}
          position="🥈"
          streams="10B"
        />
        <TopArtist
          user={{
            name: "Tony Boy",
            username: "tonyboy",
            avatar:
              "https://i.scdn.co/image/ab6761610000101f27fcfd9ff73fd86aabf11b54",
          }}
          position="🥇"
          streams="10B"
        />
        <TopArtist
          user={{
            name: "Tony Boy",
            username: "tonyboy",
            avatar:
              "https://i.scdn.co/image/ab6761610000101f27fcfd9ff73fd86aabf11b54",
          }}
          position="🥉"
          streams="10B"
        />
      </div>

      <div className="flex flex-col gap-3 h-full max-h-[58vh] overflow-y-auto">
        {Array.from({ length: 15 }).map((_, i) => (
          <Artist
            key={i}
            user={{
              name: "Tony Boy",
              username: "tonyboy",
              avatar:
                "https://i.scdn.co/image/ab6761610000101f27fcfd9ff73fd86aabf11b54",
            }}
            position={(i + 4).toString()}
            streams="10B"
          />
        ))}
      </div>
    </div>
  );
}
