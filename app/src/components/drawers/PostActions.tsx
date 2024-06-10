import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";
import { FaEllipsisH } from "react-icons/fa";
import { Button } from "../ui/button";

export default function PostActions({ color }: { color: "white" | "black" }) {
  const { t } = useTranslation();

  return (
    <Drawer>
      <DrawerTrigger>
        <FaEllipsisH fontSize={25} style={{ color }} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h4 className="font-semibold text-center">{t("post.actions.title")}</h4>

        <div className="flex gap-3">
          <Button className="w-full flex gap-3" variant="secondary">
            {t("post.actions.share")}
          </Button>
          <Button className="w-full flex gap-3" variant="secondary">
            {t("post.actions.not_interested")}
          </Button>
        </div>

        <Button className="flex gap-3" variant="secondary">
          {t("post.actions.hide")}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
