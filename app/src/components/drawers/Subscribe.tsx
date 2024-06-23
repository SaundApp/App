import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { User } from "@/types/prisma/models";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { axiosClient } from "@/lib/axios";

export default function Subscribe({
  user,
  open,
  onOpenChange,
}: {
  user: User;
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
        
        <ul className="list-inside list-disc h-[33vh] max-h-[33vh] overflow-y-auto">
          {user.subscriptionSettings.perks.map((perk, index) => (
            <li key={index}>{perk}</li>
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
          className="bg-gradient-to-r from-violet-600 to-indigo-600 animated-background"
        >
          {t("account.subscribe")}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
