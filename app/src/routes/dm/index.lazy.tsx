import Chat from "@/components/dm/Chat";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/axios";
import type { Message } from "backend";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PublicUser } from "@/types/prisma";

export const Route = createLazyFileRoute("/dm/")({
  component: DmList,
});

function DmList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data } = useQuery<
    { user: PublicUser; lastMessage: Message; read: boolean }[]
  >({
    queryKey: ["dm"],
    queryFn: async () => axiosClient.get("/dm/list").then((res) => res.data),
  });
  const { data: users } = useQuery<User[]>({
    queryKey: ["users", search],
    queryFn: () =>
      axiosClient.get(`/users/search?q=${search}`).then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-3">
      <h1>{t("dm.title")}</h1>
      <Input
        placeholder={t("general.search")}
        className="bg-secondary"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="flex flex-col gap-3 h-full max-h-[80vh] overflow-y-auto">
        {data?.length === 0 && users?.length === 0 && (
          <div className="muted">{t("general.empty")}</div>
        )}
        {!search &&
          data?.map((dm) => (
            <Chat
              key={dm.user.id}
              user={dm.user}
              message={dm.lastMessage.text}
              read={dm.read}
            />
          ))}
        {users?.map((user) => <Chat key={user.id} user={user} read={true} />)}
      </div>
    </div>
  );
}
