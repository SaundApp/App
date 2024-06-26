import { axiosClient } from "@/lib/axios";
import type { NotificationButton } from "@repo/backend-common/types";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import React from "react";
import Avatar from "./account/Avatar";
import { Button } from "./ui/button";
import { useDate } from "@/lib/dates";

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
  const queryClient = useQueryClient();
  const { formatDistance } = useDate();

  return (
    <div className="flex w-full flex-row items-start gap-3">
      {imageId && <Avatar imageId={imageId} width={40} height={40} />}

      <Link to={href} className="break-words">
        <p className="text-left leading-5">{text}</p>
        <p className="muted">{formatDistance(timestamp)}</p>
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
