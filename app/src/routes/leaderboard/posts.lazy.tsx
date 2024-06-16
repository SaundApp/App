import LeaderboardNavbar from "@/components/leaderboard/LeaderboardNavbar";
import Post from "@/components/leaderboard/Post";
import TopPost from "@/components/leaderboard/TopPost";
import { axiosClient } from "@/lib/axios";
import { Post as PostType } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/leaderboard/posts")({
  component: Songs,
});

function Songs() {
  const { t, i18n } = useTranslation();
  const { data } = useQuery<PostType[]>({
    queryKey: ["leaderboards", i18n.language],
    queryFn: async () =>
      await axiosClient
        .get(`/leaderboards/posts/${i18n.language}`)
        .then((res) => res.data),
  });

  if (!data) return;

  return (
    <div className="flex flex-col gap-3">
      <LeaderboardNavbar />

      <h1>{t("leaderboard.top")} Posts</h1>

      {data.length < 3 && <p className="muted">{t("leaderboard.no_data")}</p>}
      {data.length >= 3 && (
        <>
          <div className="flex flex-row justify-between">
            <TopPost
              post={data?.[1]}
              position="🥈"
              streams={data?.[1]?.streams || 0}
            />
            <TopPost
              post={data?.[0]}
              position="🥇"
              streams={data?.[0]?.streams || 0}
            />
            <TopPost
              post={data?.[2]}
              position="🥉"
              streams={data?.[2]?.streams || 0}
            />
          </div>

          <div className="flex flex-col gap-3 h-full max-h-[60vh] overflow-y-auto">
            {data
              ?.slice(3)
              .map((post, i) => (
                <Post
                  key={post.id}
                  post={post}
                  position={i + 4}
                  description={
                    Intl.NumberFormat("en", { notation: "compact" }).format(
                      post.streams || 0
                    ) + " streams"
                  }
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
