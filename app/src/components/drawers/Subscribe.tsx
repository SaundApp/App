import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import type { SubscriptionSettings } from "backend";
import { MdVerified } from "react-icons/md";

export default function Subscribe({
  user,
  open,
  onOpenChange,
}: {
  user: PublicUser & {
    subscriptionSettings: SubscriptionSettings;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  if (!user.subscriptionSettings) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-3 px-5 flex flex-col gap-3 no-focus justify-center">
        <h5 className="text-center">
          {t("account.subscription.title", { username: user.username })}
        </h5>
        <p className="muted text-center">
          {t("account.subscription.description", {
            price: user.subscriptionSettings.price / 100,
          })}
        </p>

        <ul className="h-[33vh] max-h-[33vh] overflow-y-auto">
          {user.subscriptionSettings.perks.map((perk, index) => (
            <li key={index} className="flex items-center gap-2">
              <MdVerified fontSize={20} />
              {perk}
            </li>
          ))}
        </ul>

        <Button
          onClick={() => {
            axiosClient
              .post(`/users/${user.id}/subscribe`)
              .then((res) => res.data)
              .then((data: { url: string }) => {
                window.open(data.url, "_blank");
              });
          }}
        >
          {t("account.subscribe")}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
