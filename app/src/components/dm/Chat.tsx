import { axiosClient } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SwipeToRevealActions from "react-swipe-to-reveal-actions";
import Avatar from "../account/Avatar";
import type { PublicUser } from "@/types/prisma";

export default function Chat({
  user,
  message,
  read,
  timestamp,
}: {
  user: PublicUser;
  message?: string;
  read: boolean;
  timestamp?: Date;
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
              {t("dm.mute")}
            </div>
          ),
          // TODO: Implement mute functionality
          onClick: () => {},
        },
        {
          content: (
            <div className="bg-destructive h-full w-full flex items-center justify-center">
              {t("dm.delete")}
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
        <Avatar user={user} width={40} height={40} />
        <div>
          <h5 className="max-w-[10rem] text-left text-ellipsis whitespace-nowrap overflow-hidden">
            {user.name}
          </h5>
          <div className="flex gap-1 items-center">
            {(message && (
              <>
                <p className="max-w-[10rem] text-left text-ellipsis whitespace-nowrap overflow-hidden">
                  {message.startsWith(`${import.meta.env.VITE_APP_URL}/`)
                    ? t("dm.attachment")
                    : message}
                </p>
                <p className="muted"> • </p>
                <p className="muted">{moment(timestamp).fromNow()}</p>
              </>
            )) || (
              <p className="muted max-w-[10rem] text-left text-ellipsis whitespace-nowrap overflow-hidden">
                @{user.username}
              </p>
            )}
          </div>
        </div>
        {!read && (
          <span className="block w-2 h-2 rounded-full bg-primary ml-auto"></span>
        )}
      </Link>
    </SwipeToRevealActions>
  );
}
