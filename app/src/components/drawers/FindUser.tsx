import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Avatar from "../account/Avatar";
import { Input } from "../ui/input";

export default function FindUser({
  onClick,
  filter,
  children,
}: {
  onClick?: (user: PublicUser) => Promise<boolean>;
  filter?: (user: PublicUser) => boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const { data } = useQuery<PublicUser[]>({
    queryKey: ["users"],
    queryFn: () =>
      axiosClient
        .get(`/users/search?q=${search}&friends=true`)
        .then((res) => res.data),
  });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="flex flex-col gap-3 p-3">
        <Input
          placeholder={t("general.search")}
          className="bg-secondary"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex h-[33vh] max-h-[33vh] flex-col gap-3 overflow-y-auto">
          {data
            ?.filter(
              (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase()),
            )
            .filter(filter || (() => true))
            .map((user) => (
              <button
                key={user.id}
                className="flex items-center justify-between"
                onClick={async () => {
                  if (onClick && (await onClick(user))) setOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar user={user} width={40} height={40} />

                  <div>
                    <h5 className="max-w-40 truncate text-left">{user.name}</h5>
                    <p className="muted max-w-40 truncate text-left">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
