import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export default function UnlinkAccount({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="no-focus flex flex-col justify-center gap-3 p-3 px-5">
        <DrawerTitle className="text-center">
          {t("account.unlink.spotify.title")}
        </DrawerTitle>
        <DrawerDescription className="muted text-center">
          {t("account.unlink.spotify.description")}
        </DrawerDescription>

        <Button
          variant="destructive"
          className="pb-8"
          onClick={() => {
            axiosClient.post(`/auth/spotify/unlink`).then(() => {
              toast({
                description: t("account.unlink.spotify.success"),
              });
            });
          }}
        >
          <p className="m-auto">{t("account.unlink.spotify.title")}</p>
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
