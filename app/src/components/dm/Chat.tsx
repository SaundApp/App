import { axiosClient } from "@/lib/axios";
import { useDate } from "@/lib/dates";
import type { Chat } from "@repo/backend-common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";
import Avatar from "../account/Avatar";

export default function Chat({
  chat,
  message,
  read,
  timestamp,
}: {
  chat: Chat;
  message?: string;
  read: boolean;
  timestamp?: Date;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { formatDistance } = useDate();

  const { data: mutedChats } = useQuery<string[]>({
    queryKey: ["mute"],
    queryFn: () =>
      axiosClient.get("/notifications/mute").then((res) => res.data),
  });

  const deleteChat = useMutation({
    mutationFn: () => axiosClient.delete(`/dm/${chat.id}`),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["dm"] }),
  });

  const muteChat = useMutation({
    mutationFn: () => axiosClient.post(`/notifications/mute/${chat.id}`),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["mute"] }),
  });

  const unmuteChat = useMutation({
    mutationFn: () => axiosClient.delete(`/notifications/mute/${chat.id}`),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["mute"] }),
  });

  if (deleteChat.isPending) return null;

  return (
    <SwipeToRevealActions
      hideDotsButton={true}
      containerStyle={{
        minHeight: "56px",
      }}
      actionButtons={[
        {
          content: (
            <div className="flex size-full items-center justify-center bg-secondary">
              {mutedChats?.includes(chat.id) ? t("dm.unmute") : t("dm.mute")}
            </div>
          ),
          onClick: () => {
            if (mutedChats?.includes(chat.id)) unmuteChat.mutate();
            else muteChat.mutate();
          },
        },
        {
          content: (
            <div className="flex size-full items-center justify-center bg-destructive">
              {t("dm.delete")}
            </div>
          ),
          onClick: () => deleteChat.mutate(),
        },
      ]}
      actionButtonMinWidth={70}
    >
      <Link
        to={`/dm/${chat.id}`}
        className="flex w-full flex-row items-center gap-3"
      >
        <Avatar imageId={chat.imageId} width={40} height={40} />
        <div>
          <h5 className="max-w-40 truncate text-left">{chat.name}</h5>
          <div className="flex items-center gap-1">
            {message ? (
              <>
                <p className="max-w-40 truncate text-left">
                  {message.startsWith(`${import.meta.env.VITE_APP_URL}/`)
                    ? t("dm.attachment")
                    : message}
                </p>
                <p className="muted"> • </p>
                <p className="muted">
                  {timestamp && formatDistance(timestamp)}
                </p>
              </>
            ) : (
              <p className="muted max-w-40 truncate text-left">@{chat.name}</p>
            )}
          </div>
        </div>
        {!read && (
          <span className="ml-auto block size-2 rounded-full bg-primary"></span>
        )}
      </Link>
    </SwipeToRevealActions>
  );
}
