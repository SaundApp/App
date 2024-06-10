import Artist from "@/components/leaderboard/Artist";
import { Input } from "@/components/ui/input";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";

export const Route = createLazyFileRoute("/search")({
  component: Search,
});

function Search() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <Input placeholder={t("general.search")} className="bg-secondary" />

      <div className="flex flex-col gap-3 h-full max-h-[88vh] overflow-y-auto">
        {Array.from({ length: 20 }).map((_, i) => (
          <div className="flex items-center justify-between">
            <Artist
              key={i}
              user={{
                name: "Tony Boy",
                username: "tonyboy",
                avatar:
                  "https://i.scdn.co/image/ab6761610000101f27fcfd9ff73fd86aabf11b54",
                followers: 0,
                following: 0,
                posts: 0,
                bio: "",
                public: true,
              }}
              position={""}
              streams="10B"
            />

            <FaXmark fontSize="25" />
          </div>
        ))}
      </div>
    </div>
  );
}
