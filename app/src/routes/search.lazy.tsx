import Artist from "@/components/leaderboard/Artist";
import { useSession } from "@/components/SessionContext";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";

export const Route = createLazyFileRoute("/search")({
  component: Search,
});

function Search() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<User[]>([]);
  const session = useSession();
  const { data } = useQuery<User[]>({
    queryKey: ["users", search],
    queryFn: () =>
      axiosClient.get(`/users/search?q=${search}`).then((res) => res.data),
  });

  useEffect(() => {
    const searchHistory = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );

    axiosClient
      .get(`/users/search?q=${searchHistory.join(",")}`)
      .then((res) => setHistory(res.data));
  }, [localStorage.getItem("searchHistory")]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder={t("general.search")}
        className="bg-secondary"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="flex flex-col gap-3 h-full max-h-[88vh] overflow-y-auto">
        {data
          ?.filter((user) => user.username !== session?.username)
          .map((user) => (
            <Artist
              key={user.id}
              user={user}
              description={"@" + user.username}
              onClick={() => {
                const searchHistory = JSON.parse(
                  localStorage.getItem("searchHistory") || "[]"
                );

                if (!searchHistory.includes(user.username)) {
                  localStorage.setItem(
                    "searchHistory",
                    JSON.stringify([...searchHistory, user.username])
                  );
                }
              }}
            />
          ))}

        {!data?.length &&
          history.map((user) => (
            <div className="flex items-center justify-between" key={user.id}>
              <Artist user={user} description={"@" + user.username} />

              <button
                onClick={() => {
                  localStorage.removeItem("searchHistory");
                  setHistory([]);
                }}
              >
                <FaXmark fontSize={25} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
