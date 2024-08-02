import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import { Capacitor } from "@capacitor/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaChevronDown } from "react-icons/fa";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import { Button } from "../ui/button";
import VisuallyHidden from "../ui/visually-hidden";
import { useNavigate } from "@tanstack/react-router";
import { useStorageState } from "../storage/StorageProvider";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

export default function Accounts() {
  const { t } = useTranslation();
  const session = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [[isLoading, tokens], setTokens] = useStorageState(
    "tokens",
    SecureStoragePlugin,
  );
  const [, setToken] = useStorageState("token", SecureStoragePlugin);
  const { data } = useQuery<
    (PublicUser & {
      token: string;
    })[]
  >({
    queryKey: ["accounts", tokens],
    queryFn: () =>
      isLoading || !tokens
        ? []
        : axiosClient
            .get(
              `/auth/accounts?tokens=${JSON.parse(tokens || "[]").join(",")}`,
            )
            .then((res) => res.data),
  });

  useEffect(() => {
    if (data && !isLoading) {
      let parsedTokens: string[] = JSON.parse(tokens || "[]");
      for (const user of data) {
        const same = data
          .filter((u) => u.username === user.username && u.token !== user.token)
          .map((u) => u.token);

        if (same.length) {
          parsedTokens = parsedTokens.filter((token) => !same.includes(token));
        }
      }

      setTokens(JSON.stringify(parsedTokens));
      queryClient.invalidateQueries({
        queryKey: ["accounts", parsedTokens],
      });
    }
  }, [data, tokens, isLoading, setTokens, queryClient]);

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
                    setToken(user.token);
                    navigate({
                      to: "/",
                    });
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

          <div
            className={
              "absolute bottom-0 w-full bg-background pt-3" +
              (Capacitor.getPlatform() === "ios" ? " pb-8" : "")
            }
          >
            <Button
              variant="secondary"
              className="mt-auto w-full"
              onClick={() => {
                setToken(null);
                navigate({
                  to: "/auth/login",
                });
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
