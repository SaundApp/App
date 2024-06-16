import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane } from "react-icons/fa";
import Avatar from "../account/Avatar";
import { Input } from "../ui/input";

export default function Share({ postId }: { postId: string }) {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const { data } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () =>
      axiosClient
        .get(`/users/search?q=${search}&friends=true`)
        .then((res) => res.data),
  });

  return (
    <Drawer>
      <DrawerTrigger>
        <FaPaperPlane fontSize={25} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <Input
          placeholder={t("post.share.search")}
          className="bg-secondary"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex flex-col gap-3 h-[33vh] max-h-[33vh] overflow-y-auto">
          {data
            ?.filter(
              (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <Link
                to={`/dm/${user.username}`}
                search={{
                  text: `${import.meta.env.VITE_APP_URL}/?post=${postId}`,
                  submit: true,
                }}
                key={user.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar user={user} width={40} height={40} />

                  <div>
                    <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      {user.name}
                    </h5>
                    <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
