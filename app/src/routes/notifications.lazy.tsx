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
      <h1>{t("general.notifications")}</h1>
      <h3>{t("general.today")}</h3>

      <div className="flex flex-col gap-3 h-full max-h-[80vh] overflow-y-auto">
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
            <p className="font-normal">{item.text}</p>
          </Notification>
        ))}
      </div>
    </div>
  );
}
