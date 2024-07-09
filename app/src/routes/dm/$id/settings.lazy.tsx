import { useSession } from "@/components/SessionContext";
import Avatar from "@/components/account/Avatar";
import ChatNavbar from "@/components/dm/ChatNavbar";
import FindUser from "@/components/drawers/FindUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import type { Chat } from "@repo/backend-common/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";

export const Route = createLazyFileRoute("/dm/$id/settings")({
  component: ChatSettings,
});

function ChatSettings() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const { toast } = useToast();
  const session = useSession();
  const input = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

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
  if (chat.ownerId !== session?.id) return null;

  return (
    <div className="flex h-full flex-col gap-3">
      <ChatNavbar chat={chat} hideLogo />

      <div className="flex items-center justify-center">
        <input
          name="avatar"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "IMAGE");

            axiosClient
              .post("/attachments/upload", formData)
              .then((res) => res.data)
              .then((data) => {
                axiosClient
                  .patch(`/dm/${chat.id}/update`, {
                    imageId: data.id,
                  })
                  .then(() => {
                    toast({
                      description: t("toast.success.edit_image"),
                    });

                    queryClient.invalidateQueries({
                      queryKey: ["dm", id],
                    });
                  });
              });
          }}
          hidden
          ref={input}
          type="file"
          accept="image/png"
        />
        <Avatar
          imageId={chat.imageId}
          width={80}
          height={80}
          onClick={(e) => {
            e.preventDefault();
            input.current?.click();
          }}
        />
      </div>
      <form
        className="my-3 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          axiosClient
            .patch(`/dm/${chat.id}/update`, {
              name: formData.get("name"),
              private: formData.get("private") === "on",
            })
            .then(() => {
              toast({
                description: t("toast.success.edit"),
              });

              queryClient.invalidateQueries({
                queryKey: ["dm", id],
              });
            });
        }}
      >
        <Input
          type="text"
          name="name"
          defaultValue={chat.name}
          placeholder={t("input.name")}
          className="w-full bg-secondary"
        />
        <div className="flex items-center gap-2">
          <Switch name="private" defaultChecked={chat.private} />
          <p className="muted">{t("account.private")}</p>
        </div>
        <Button className="w-full" type="submit">
          {t("account.save")}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <p>{t("dm.members")}</p>
        <FindUser
          filter={(user) => !members?.some((member) => member.id === user.id)}
          onClick={async (user) => {
            axiosClient
              .put(`/dm/${id}/members`, { userId: user.id })
              .then(() => {
                queryClient.invalidateQueries({
                  queryKey: ["dm", id, "members"],
                });
              });

            setSearch("");
            return true;
          }}
        >
          <Button className="w-full">{t("dm.add_member")}</Button>
        </FindUser>
        <Input
          type="text"
          placeholder={t("general.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-secondary"
        />

        <div className="flex max-h-[30rem] flex-col overflow-y-auto">
          {members
            ?.filter((member) =>
              member.username.toLowerCase().includes(search.toLowerCase()),
            )
            .map((member) => (
              <SwipeToRevealActions
                hideDotsButton={true}
                containerStyle={{
                  minHeight: 50,
                }}
                actionButtons={[
                  {
                    content: (
                      <div className="flex size-full items-center justify-center bg-destructive">
                        {t("dm.delete")}
                      </div>
                    ),
                    onClick: () => {
                      axiosClient
                        .delete(`/dm/${id}/members?userId=${member.id}`)
                        .then(() => {
                          queryClient.invalidateQueries({
                            queryKey: ["dm", id, "members"],
                          });
                        });
                    },
                  },
                ]}
                key={member.id}
                actionButtonMinWidth={70}
              >
                <div className="flex items-center gap-3">
                  <Avatar user={member} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="max-w-40 truncate text-left">{member.name}</h5>
                    <p className="muted max-w-40 truncate text-left">
                      @{member.username}
                    </p>
                  </div>
                </div>
              </SwipeToRevealActions>
            ))}
        </div>
      </div>

      <Button
        className="mt-auto"
        variant="destructive"
        onClick={() => {
          axiosClient.delete(`/dm/${id}`).then(() => {
            navigate({
              to: "/dm",
            });
          });
        }}
      >
        {t("dm.delete")}
      </Button>
    </div>
  );
}
