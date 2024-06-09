import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { User } from "@/types";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function Likes({
  likes,
  open,
  onOpenChange,
}: {
  likes: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h4 className="font-semibold text-center">{t("post.likes.title")}</h4>

        <Input placeholder={t("general.search")} className="bg-secondary" />

        <div className="flex flex-col gap-3">
          {likes.map((like) => (
            <div key={like.username} className="flex justify-between">
              <div className="flex gap-3 items-center">
                <img
                  src={like.avatar}
                  alt={like.username}
                  draggable={false}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">{like.name}</p>
                  <p className="muted">{like.username}</p>
                </div>
              </div>

              <Button>{t("general.follow")}</Button>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
