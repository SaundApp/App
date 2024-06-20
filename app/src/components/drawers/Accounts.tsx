import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { FaChevronDown } from "react-icons/fa";
import Avatar from "../account/Avatar";
import { useSession } from "../SessionContext";

export default function Accounts() {
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
        {data?.map((user) => (
          <button
            onClick={() => {
              localStorage.setItem("token", user.token);
              window.location.reload();
            }}
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
          </button>
        ))}
      </DrawerContent>
    </Drawer>
  );
}
