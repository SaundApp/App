import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { SocialUrl } from "@/types/prisma/models";
import { useTranslation } from "react-i18next";
import { FaEllipsisH } from "react-icons/fa";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

export default function PostActions({
  color,
  urls,
}: {
  color: "white" | "black";
  urls: SocialUrl;
}) {
  const { t } = useTranslation();

  return (
    <Drawer>
      <DrawerTrigger>
        <FaEllipsisH fontSize={25} style={{ color }} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h4 className="font-semibold text-center">{t("post.actions.title")}</h4>

        <div className="flex gap-3">
          {urls?.spotify && (
            <Button className="w-full flex gap-3" variant="secondary" asChild>
              <Link to={urls.spotify}>Spotify</Link>
            </Button>
          )}
          {urls?.amazon && (
            <Button className="w-full flex gap-3" variant="secondary" asChild>
              <Link to={urls.amazon}>Amazon Music</Link>
            </Button>
          )}
          {urls?.apple && (
            <Button className="w-full flex gap-3" variant="secondary" asChild>
              <Link to={urls.apple}>Apple Music</Link>
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
