import Notification from "@/components/Notification";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/notifications")({
  component: Notifications,
});

function Notifications() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <h1>{t("general.notifications")}</h1>
      <h3>{t("general.today")}</h3>

      <div className="flex flex-col gap-3 h-full max-h-[80vh] overflow-y-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <Notification
            key={index}
            image="https://michelemanna.me/img/logo.png"
            timestamp={Date.now()}
            button={{
              text: "Follow",
              href: "/profile/michele",
            }}
          >
            <p className="font-normal">
              <span className="font-semibold">Michele</span> liked your post
            </p>
          </Notification>
        ))}
      </div>
    </div>
  );
}
