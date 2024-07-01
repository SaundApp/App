import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaChevronDown } from "react-icons/fa";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import { Button } from "../ui/button";
import VisuallyHidden from "../ui/visually-hidden";

export default function Accounts() {
  const { t } = useTranslation();
  const session = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery<
    (PublicUser & {
      token: string;
    })[]
  >({
    queryKey: ["accounts"],
    queryFn: () =>
      axiosClient
        .get(
          `/auth/accounts?tokens=${JSON.parse(localStorage.getItem("tokens") || "[]").join(",")}`,
        )
        .then((res) => res.data),
  });

  useEffect(() => {
    if (data) {
      let tokens: string[] = JSON.parse(localStorage.getItem("tokens") || "[]");
      for (const user of data) {
        const same = data
          .filter((u) => u.username === user.username && u.token !== user.token)
          .map((u) => u.token);

        if (same.length) {
          tokens = tokens.filter((token) => !same.includes(token));
        }
      }

      localStorage.setItem("tokens", JSON.stringify(tokens));
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    }
  }, [data, queryClient]);

  return (
    <Drawer>
      <DrawerTrigger className="flex items-center gap-1">
        <h5 className="max-w-56 truncate">{session?.username}</h5>
        <FaChevronDown fontSize={20} />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col gap-3 p-3">
        <VisuallyHidden>
          <DrawerTitle>Accounts</DrawerTitle>
          <DrawerDescription>Accounts</DrawerDescription>
        </VisuallyHidden>

        <div className="relative">
          <div className="flex h-[33vh] max-h-[33vh] flex-col gap-3 overflow-y-auto">
            {data?.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between"
              >
                <div
                  className="flex items-center gap-3"
                  onClick={() => {
                    localStorage.setItem("token", user.token);
                    window.location.href = "/";
                  }}
                >
                  <Avatar user={user} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="max-w-40 truncate text-left">{user.name}</h5>
                    <p className="muted max-w-40 truncate text-left">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {user.username === session?.username && (
                  <FaCheckCircle fontSize={25} className="text-primary" />
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 w-full bg-background pt-3">
            <Button
              variant="secondary"
              className="mt-auto w-full"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
              }}
            >
              {t("account.new")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
