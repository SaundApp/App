import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";

export default function Chat({
  user,
  message,
  read,
  timestamp,
}: {
  user: User;
  message: string;
  read: boolean;
  timestamp: Date;
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  const deleteChat = useMutation({
    mutationFn: () => axiosClient.delete(`/dm/${user.username}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm"] });
    },
  });

  return (
    <SwipeToRevealActions
      hideDotsButton={true}
      containerStyle={{
        minHeight: "56px",
      }}
      actionButtons={[
        {
          content: (
            <div className="bg-secondary h-full w-full flex items-center justify-center">
              {t("messages.mute")}
            </div>
          ),
          // TODO: Implement mute functionality
          onClick: () => {},
        },
        {
          content: (
            <div className="bg-destructive h-full w-full flex items-center justify-center">
              {t("messages.delete")}
            </div>
          ),
          onClick: () => deleteChat.mutate(),
        },
      ]}
      actionButtonMinWidth={70}
    >
      <Link
        to={`/dm/${user.username}`}
        className="flex flex-row gap-3 w-full items-center"
      >
        <img
          src={user.avatarId}
          alt={user.name}
          draggable={false}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {user.name}
          </h4>
          <div className="flex gap-1 items-center">
            <p className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
              {message.startsWith(`${import.meta.env.VITE_APP_URL}/`)
                ? t("messages.attachment")
                : message}
            </p>
            <p className="muted"> • </p>
            <p className="muted">{moment(timestamp).fromNow()}</p>
          </div>
        </div>
        {!read && (
          <span className="block w-2 h-2 rounded-full bg-primary ml-auto"></span>
        )}
      </Link>
    </SwipeToRevealActions>
  );
}
