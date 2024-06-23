import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Avatar from "../account/Avatar";

export default function Mentions({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (message: string) => void;
}) {
  const [mention, setMention] = useState("");
  const { data } = useQuery<User[]>({
    queryKey: [
      "users",
      mention,
      message.includes("@") && !message.includes("@ "),
    ],
    queryFn: () =>
      message.includes("@") && !message.includes("@ ")
        ? axiosClient
            .get<User[]>(`/users/search?q=${mention}&friends=true`)
            .then((res) => res.data)
            .then((data) =>
              data.find((user) => user.username === mention) ? [] : data
            )
        : [],
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!message || !message.includes("@")) return;

      const match = Array.from(message.matchAll(/@(\w*)/g)).map(
        (match) => match[1]
      );

      if (match && match.length > 0) {
        setMention(match[match.length - 1]);
      } else {
        setMention("");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [message]);

  if (!data?.length) return null;

  return (
    <div
      className="absolute flex left-3 -ml-[1px] w-full flex-col gap-3 top-[5.5rem] bg-background overflow-y-auto"
      style={{
        height: "calc(100% - 9rem)",
        maxHeight: "calc(100% - 9rem)",
      }}
    >
      {data?.map((user) => (
        <button
          className="flex gap-3 items-center"
          key={user.id}
          onClick={() => {
            setMessage(
              message.replace(/@(\w*)/g, (match, username) =>
                username === mention ? `@${user.username} ` : match
              )
            );
          }}
        >
          <Avatar user={user} width={40} height={40} />
          <div className="flex flex-col">
            <h5 className="text-left font-semibold max-w-[10rem] text-ellipsis whitespace-nowrap overflow-hidden">
              {user.name}
            </h5>
            <p className="muted text-left max-w-[10rem] text-ellipsis whitespace-nowrap overflow-hidden">
              @{user.username}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
