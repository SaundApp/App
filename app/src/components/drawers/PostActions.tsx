import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";
import { FaEllipsisH } from "react-icons/fa";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

export default function PostActions({
  color,
  url,
}: {
  color: "white" | "black";
  url: string;
}) {
  const { t } = useTranslation();

  return (
    <Drawer>
      <DrawerTrigger>
        <FaEllipsisH fontSize={25} style={{ color }} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h5 className="font-semibold text-center">{t("post.actions.title")}</h5>

        <div className="flex gap-3">
          {url && (
            <Button className="w-full flex gap-3" variant="secondary" asChild>
              <Link to={url}>Spotify</Link>
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button className="w-full flex gap-3" variant="secondary">
            {t("post.actions.hide")}
          </Button>
          <Button className="w-full flex gap-3" variant="secondary">
            {t("post.actions.not_interested")}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
