import Notification from "@/components/Notification";
import { axiosClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { Notification as NotificationModel } from "backend";
import type { PublicUser } from "@/types/prisma";

export const Route = createLazyFileRoute("/notifications")({
  component: Notifications,
});

function Notifications() {
  const { t } = useTranslation();
  const { data } = useQuery<
    (NotificationModel & {
      involvedUserData: PublicUser | null;
    })[]
  >({
    queryKey: ["notifications"],
    queryFn: () => axiosClient.get("/notifications").then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-3">
      <h1>{t("notification.title")}</h1>

      <div className="flex h-[85vh] max-h-[85vh] flex-col gap-3 overflow-y-auto">
        {data?.length === 0 && (
          <div className="flex size-full flex-col items-center justify-center">
            <h5>{t("general.empty")}</h5>
            <p className="muted text-center">
              {t("general.empty_description")}
            </p>
          </div>
        )}

        {data?.map((item) => (
          <Notification
            key={item.id}
            imageId={item.involvedUserData?.avatarId || undefined}
            timestamp={new Date(item.createdAt)}
            button={item.button}
            href={
              item.involvedUserData
                ? `/account/${item.involvedUserData.username}`
                : undefined
            }
          >
            {item.text}
          </Notification>
        ))}
      </div>
    </div>
  );
}
