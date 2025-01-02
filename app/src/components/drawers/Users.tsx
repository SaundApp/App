import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import FollowButton from "../account/FollowButton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import VisuallyHidden from "../ui/visually-hidden";

export default function Users({
  users,
  open,
  onOpenChange,
  title,
  isFollowers,
  userId,
}: {
  users: PublicUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isFollowers?: boolean;
  userId?: string;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const session = useSession();
  const removeFollower = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/follower`),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      if (!userId) return;

      await queryClient.invalidateQueries({
        queryKey: ["following", userId],
      });
      return await queryClient.invalidateQueries({
        queryKey: ["followers", userId],
      });
    },
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="no-focus flex flex-col gap-3 p-3">
        <DrawerTitle className="text-center">{title}</DrawerTitle>

        <VisuallyHidden>
          <DrawerDescription>{t("dm.members")}</DrawerDescription>
        </VisuallyHidden>

        <Input
          placeholder={t("general.search")}
          className="bg-secondary"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex h-[33vh] max-h-[33vh] flex-col gap-3 overflow-y-auto">
          {users.length === 0 && (
            <div className="flex size-full flex-col items-center justify-center">
              <h5>{t("general.empty")}</h5>
              <p className="muted text-center">
                {t("general.empty_description")}
              </p>
            </div>
          )}

          {users
            .filter(
              (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase()),
            )
            .map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between"
              >
                <Link
                  to="/account/$username"
                  params={{ username: user.username }}
                  className="flex items-center gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <Avatar user={user} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="max-w-40 truncate text-left">{user.name}</h5>
                    <p className="muted max-w-40 truncate text-left">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                {!isFollowers && session?.username !== user.username && (
                  <FollowButton username={user.username} />
                )}

                {!removeFollower.isPending &&
                  isFollowers &&
                  session?.username !== user.username &&
                  session?.private && (
                    <Button
                      onClick={() => {
                        removeFollower.mutate(user.id);
                      }}
                      variant="secondary"
                    >
                      {t("general.remove_follower")}
                    </Button>
                  )}
              </div>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
