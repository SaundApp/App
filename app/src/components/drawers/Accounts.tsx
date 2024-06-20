import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { FaChevronDown } from "react-icons/fa";
import Avatar from "../account/Avatar";
import { useSession } from "../SessionContext";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

export default function Accounts() {
  const { t } = useTranslation();
  const session = useSession();
  const { data } = useQuery<
    (User & {
      token: string;
    })[]
  >({
    queryKey: ["accounts"],
    queryFn: () =>
      axiosClient
        .get(
          `/auth/accounts?tokens=${JSON.parse(localStorage.getItem("tokens") || "[]").join(",")}`
        )
        .then((res) => res.data),
  });

  return (
    <Drawer>
      <DrawerTrigger className="flex items-center gap-1">
        <h5>{session?.username}</h5>
        <FaChevronDown fontSize={20} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <div className="relative">
          <div className="flex flex-col gap-3 h-[33vh] max-h-[33vh] overflow-y-auto">
            {data?.map((user) => (
              <div key={user.username} className="flex justify-between">
                <div
                  className="flex gap-3 items-center"
                  onClick={() => {
                    localStorage.setItem("token", user.token);
                    window.location.reload();
                  }}
                >
                  <Avatar user={user} width={40} height={40} />
                  <div className="flex flex-col">
                    <h5 className="text-left max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      {user.name}
                    </h5>
                    <p className="text-left muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    let tokens = JSON.parse(
                      localStorage.getItem("tokens") || "[]"
                    );

                    tokens = tokens.filter((t: string) => t !== token);
                    localStorage.setItem("tokens", JSON.stringify(tokens));
                    if (tokens.length > 0)
                      localStorage.setItem("token", tokens[0]);
                    else localStorage.removeItem("token");
                    window.location.reload();
                  }}
                >
                  {t("account.remove")}
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-black absolute bottom-0 w-full pt-3">
            <Button
              variant="secondary"
              className="mt-auto w-full"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
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
