import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function Users({
  users,
  open,
  onOpenChange,
  title
}: {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const session = useSession();
  const follow = useMutation({
    mutationFn: (user: string) => axiosClient.post(`/users/${user}/follow`),
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
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h5 className="font-semibold text-center">{title}</h5>

        <Input
          placeholder={t("general.search")}
          className="bg-secondary"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex flex-col gap-3 h-[33vh] max-h-[33vh] overflow-y-auto">
          {users.length === 0 && (
            <p className="muted">{t("post.likes.empty")}</p>
          )}

          {users
            .filter(
              (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <Link
                to={`/account/${user.username}`}
                key={user.username}
                className="flex justify-between"
              >
                <div className="flex gap-3 items-center">
                  <Avatar user={user} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="font-semibold max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      {user.name}
                    </h5>
                    <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {session?.username !== user.username && (
                  <Button
                    onClick={() => {
                      if (
                        !session?.following.find(
                          (user) => user.followingId === user.id
                        )
                      )
                        follow.mutate(user.id);
                      else unfollow.mutate(user.id);
                    }}
                    className={
                      !session?.following.find(
                        (user) => user.followingId === user.id
                      )
                        ? ""
                        : "bg-secondary"
                    }
                  >
                    {!session?.following.find(
                      (user) => user.followingId === user.id
                    )
                      ? t("general.follow")
                      : t("general.unfollow")}
                  </Button>
                )}
              </Link>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
