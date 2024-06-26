import Artist from "@/components/leaderboard/Artist";
import TopArtist from "@/components/leaderboard/TopArtist";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/axios";
import type { User } from "@repo/backend-common/types";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/leaderboard/artists")({
  component: Artists,
});

function Artists() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<User[]>({
    queryKey: ["leaderboards"],
    queryFn: async () =>
      await axiosClient.get(`/leaderboards/artists`).then((res) => res.data),
  });

  if (isLoading) return <Spinner className="m-auto" />;
  if (!data) return;

  return (
    <div className="flex h-full flex-col gap-3">
      <h1>{t("leaderboard.title")}</h1>

      {data?.length < 3 && (
        <div className="flex size-full flex-col items-center justify-center">
          <h5>{t("general.empty")}</h5>
          <p className="muted text-center">{t("general.empty_description")}</p>
        </div>
      )}

      {data.length >= 3 && (
        <>
          <div className="flex justify-between">
            <TopArtist
              user={data?.[1]}
              position="🥈"
              streams={data?.[1]?.streams || 0}
            />
            <TopArtist
              user={data?.[0]}
              position="🥇"
              streams={data?.[0]?.streams || 0}
            />
            <TopArtist
              user={data?.[2]}
              position="🥉"
              streams={data?.[2]?.streams || 0}
            />
          </div>

          <div className="flex h-full max-h-[57vh] flex-col gap-3 overflow-y-auto">
            {data
              ?.slice(3)
              .map((user, i) => (
                <Artist
                  key={user.id}
                  user={user}
                  position={i + 4}
                  description={
                    Intl.NumberFormat("en", { notation: "compact" }).format(
                      user.streams || 0,
                    ) + ` ${t("leaderboard.streams")}`
                  }
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
