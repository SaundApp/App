import Chat from "@/components/dm/Chat";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/axios";
import { Message, User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/dm/")({
  component: DmList,
});

function DmList() {
  const { t } = useTranslation();
  const { data } = useQuery<
    { user: User; lastMessage: Message; read: boolean }[]
  >({
    queryKey: ["dm"],
    queryFn: async () => axiosClient.get("/dm/list").then((res) => res.data),
  });
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <h1>{t("messages.messages")}</h1>
      <Input
        placeholder={t("messages.search")}
        className="bg-secondary"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="flex flex-col gap-3 h-full max-h-[80vh] overflow-y-auto">
        {data?.length === 0 && (
          <div className="muted">{t("messages.no-messages")}</div>
        )}

        {data
          ?.filter(
            (chat) =>
              chat.user.name.toLowerCase().includes(search.toLowerCase()) ||
              chat.user.username.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <Chat
              key={chat.user.id}
              timestamp={chat.lastMessage.createdAt}
              user={chat.user}
              message={chat.lastMessage.text}
              read={chat.read}
            />
          ))}
      </div>
    </div>
  );
}
