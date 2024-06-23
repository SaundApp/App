import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import type { NotificationButton } from "backend";
import Avatar from "./account/Avatar";
import { axiosClient } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function Notification({
  imageId,
  children: text,
  timestamp,
  button,
  href,
}: {
  imageId?: string;
  children: React.ReactElement | string;
  timestamp: Date;
  button: NotificationButton | null;
  href?: string;
}) {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <div className="flex flex-row gap-3 w-full items-center">
      {imageId && <Avatar imageId={imageId} width={40} height={40} />}

      <Link to={href}>
        <h5>{text}</h5>
        <p className="muted">{moment(timestamp).fromNow()}</p>
      </Link>

      {button && (
        <Button
          className="ml-auto"
          onClick={() => {
            axiosClient.post(button.href).then(() => {
              queryClient.invalidateQueries({
                queryKey: ["notifications"],
              });
            });
          }}
        >
          {button.text}
        </Button>
      )}
    </div>
  );
}
