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
      <DrawerContent className="p-3 flex flex-col gap-3 no-focus">
        <h5 className="text-center">{title}</h5>

        <Input
          placeholder={t("general.search")}
          className="bg-secondary"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex flex-col gap-3 h-[33vh] max-h-[33vh] overflow-y-auto">
          {users.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center">
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
                user.username.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <div
                key={user.username}
                className="flex justify-between items-center"
              >
                <Link
                  to={`/account/${user.username}`}
                  className="flex gap-3 items-center"
                  onClick={() => onOpenChange(false)}
                >
                  <Avatar user={user} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="text-left max-w-[10rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      {user.name}
                    </h5>
                    <p className="muted text-left max-w-[10rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                {session?.username !== user.username && (
                  <Button
                    onClick={() => {
                      if (
                        !session?.following.find(
                          (u) => u.followingId === user.id
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
