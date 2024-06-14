import { axiosClient } from "@/lib/axios";
import { User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
      className="absolute flex flex-col gap-3 top-[5.5rem] bg-black overflow-y-auto"
      style={{
        width: "calc(100% - 1.5rem)",
        height: "calc(100% - 9.75rem)",
        maxHeight: "calc(100% - 9.75rem)",
      }}
    >
      {data?.map((user) => (
        <button
          key={user.id}
          onClick={() => {
            setMessage(
              message.replace(/@(\w*)/g, (match, username) =>
                username === mention ? `@${user.username} ` : match
              )
            );
          }}
          className="flex items-center gap-3 w-full text-left"
        >
          <img
            src={user.avatarId}
            alt={user.username}
            draggable={false}
            className="w-10 h-10 rounded-full"
          />

          {user.username}
        </button>
      ))}
    </div>
  );
}