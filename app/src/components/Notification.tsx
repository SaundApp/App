import { Link } from "@tanstack/react-router";
import { formatDistance } from "date-fns";
import React from "react";
import { Button } from "./ui/button";
import type { NotificationButton } from "backend-common/types";
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
  const queryClient = useQueryClient();

  return (
    <div className="flex w-full flex-row items-start gap-3">
      {imageId && <Avatar imageId={imageId} width={40} height={40} />}

      <Link to={href} className="break-all">
        <p className="max-w-56 truncate text-left">{text}</p>
        <p className="muted">{formatDistance(timestamp, new Date())}</p>
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
