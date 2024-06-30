import Avatar from "@/components/account/Avatar";
import ChatNavbar from "@/components/dm/ChatNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import type { Chat } from "@repo/backend-common/types";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/dm/$id/settings")({
  component: ChatSettings,
});

function ChatSettings() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const [search, setSearch] = useState("");

  const { data: chat, isLoading } = useQuery<Chat>({
    queryKey: ["dm", id],
    queryFn: async () => axiosClient.get(`/dm/${id}`).then((res) => res.data),
  });

  const { data: members } = useQuery<PublicUser[]>({
    queryKey: ["dm", id, "members"],
    queryFn: async () =>
      axiosClient.get(`/dm/${id}/members`).then((res) => res.data),
  });

  if (isLoading || !chat) return <Spinner className="m-auto" />;

  return (
    <div className="flex flex-col gap-3">
      <ChatNavbar chat={chat} />

      <div className="flex flex-col gap-3">
        <h2>{t("Members")}</h2>
        <Input
          type="text"
          placeholder={t("Search members")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button className="w-full">Add member</Button>
        <div className="flex flex-col gap-3">
          {members
            ?.filter((member) =>
              member.username.toLowerCase().includes(search.toLowerCase()),
            )
            .map((member) => (
              <div key={member.id}>
                <div className="flex items-center gap-3">
                  <Avatar user={member} width={40} height={40} />
                  <div>{member.username}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
