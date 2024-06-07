import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";
import { BsThreeDots } from "react-icons/bs";
import { Button } from "../ui/button";
import { IoIosShareAlt } from "react-icons/io";
import { IoInformationCircleSharp } from "react-icons/io5";
import { BiSolidHide } from "react-icons/bi";
import { CgDanger } from "react-icons/cg";

export default function PostActions() {
  const { t } = useTranslation();
  
  return (
    <Drawer>
      <DrawerTrigger>
        <BsThreeDots fontSize={25} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h4 className="font-semibold text-center">{t("post.actions.title")}</h4>

        <div className="flex gap-3">
          <Button className="w-full flex gap-3" variant="secondary">
            <IoIosShareAlt fontSize={25} />
            {t("post.actions.share")}
          </Button>
          <Button className="w-full flex gap-3" variant="secondary">
            <IoInformationCircleSharp fontSize={25} />
            {t("post.actions.not_interested")}
          </Button>
        </div>

        <Button className="flex gap-3" variant="secondary">
          <BiSolidHide fontSize={25} />
          {t("post.actions.hide")}
        </Button>
        <Button className="flex gap-3" variant="destructive">
          <CgDanger fontSize={25} />
          {t("post.actions.report")}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
