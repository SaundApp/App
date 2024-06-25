import Chat from "@/components/dm/Chat";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import type { Message, User } from "backend";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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

      <div className="flex h-[80vh] max-h-[80vh] flex-col gap-3 overflow-y-auto">
        {data?.length === 0 && (
          <div className="flex size-full flex-col items-center justify-center">
            <h5>{t("general.empty")}</h5>
            <p className="muted text-center">
              {t("general.empty_description")}
            </p>
          </div>
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
