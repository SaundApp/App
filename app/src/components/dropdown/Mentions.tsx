import { axiosClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Avatar from "../account/Avatar";
import type { PublicUser } from "@/types/prisma";

export default function Mentions({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (message: string) => void;
}) {
  const [mention, setMention] = useState("");
  const { data } = useQuery<PublicUser[]>({
    queryKey: [
      "users",
      mention,
      message.includes("@") && !message.includes("@ "),
    ],
    queryFn: () =>
      message.includes("@") && !message.includes("@ ")
        ? axiosClient
            .get<PublicUser[]>(`/users/search?q=${mention}&friends=true`)
            .then((res) => res.data)
            .then((data) =>
              data.find((user) => user.username === mention) ? [] : data,
            )
        : [],
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!message || !message.includes("@")) return;

      const match = Array.from(message.matchAll(/@(\w*)/g)).map(
        (match) => match[1],
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
      className="absolute left-3 top-[5.2rem] -ml-px flex w-full flex-col gap-3 overflow-y-auto bg-background"
      style={{
        height: "calc(100% - 8.75rem)",
        maxHeight: "calc(100% - 8.75rem)",
      }}
    >
      {data?.map((user) => (
        <button
          className="flex items-center gap-3"
          key={user.id}
          onClick={() => {
            setMessage(
              message.replace(/@(\w*)/g, (match, username) =>
                username === mention ? `@${user.username} ` : match,
              ),
            );
          }}
        >
          <Avatar user={user} width={40} height={40} />
          <div className="flex flex-col">
            <h5 className="max-w-40 truncate text-left font-semibold">
              {user.name}
            </h5>
            <p className="muted max-w-40 truncate text-left">
              @{user.username}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
