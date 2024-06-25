import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { PublicUser } from "@/types/prisma";
import { useToast } from "../ui/use-toast";

export default function Users({
  users,
  open,
  onOpenChange,
  title,
}: {
  users: PublicUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const session = useSession();
  const follow = useMutation({
    mutationFn: (user: string) =>
      axiosClient
        .post(`/users/${user}/follow`)
        .then((res) => res.data)
        .then((data) => {
          if (data.request) {
            toast({
              description: t("toast.success.follow_request"),
            });
          }
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const unfollow = useMutation({
    mutationFn: (user: string) => axiosClient.delete(`/users/${user}/unfollow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="no-focus flex flex-col gap-3 p-3">
        <h5 className="text-center">{title}</h5>

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
                  to={`/account/${user.username}`}
                  className="flex items-center gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <Avatar user={user} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="max-w-40 truncate text-left">
                      {user.name}
                    </h5>
                    <p className="muted max-w-40 truncate text-left">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                {session?.username !== user.username && (
                  <Button
                    onClick={() => {
                      if (
                        !session?.following.find(
                          (u) => u.followingId === user.id,
                        )
                      )
                        follow.mutate(user.id);
                      else unfollow.mutate(user.id);
                    }}
                    variant={
                      !session?.following.find((u) => u.followingId === user.id)
                        ? "default"
                        : "secondary"
                    }
                  >
                    {!session?.following.find((u) => u.followingId === user.id)
                      ? t("general.follow")
                      : t("general.unfollow")}
                  </Button>
                )}
              </div>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
