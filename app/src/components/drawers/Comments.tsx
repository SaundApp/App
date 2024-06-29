import { axiosClient } from "@/lib/axios";
import type { ExtendedComment } from "@/types/prisma";
import type { Post } from "@repo/backend-common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaComment } from "react-icons/fa";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import Mentions from "../dropdown/Mentions";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Input } from "../ui/input";
import { useDate } from "@/lib/dates";
import { Capacitor } from "@capacitor/core";

export default function Comments({ post }: { post: Post }) {
  const { t } = useTranslation();
  const session = useSession();
  const { formatDistance } = useDate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const { data } = useQuery<ExtendedComment[]>({
    queryKey: ["posts", post.id, "comments"],
    queryFn: () =>
      axiosClient.get(`/posts/${post.id}/comments`).then((res) => res.data),
  });
  const comment = useMutation({
    mutationFn: async (text: string) => {
      setMessage("");
      return await axiosClient.post(`/posts/${post.id}/comment`, { text });
    },
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({
        queryKey: ["posts", post.id, "comments"],
      });

      const previousTodos = queryClient.getQueryData([
        "posts",
        post.id,
        "comments",
      ]);

      queryClient.setQueryData(
        ["posts", post.id, "comments"],
        (old: ExtendedComment[]) => [
          {
            id: Math.random(),
            text,
            user: session,
            createdAt: new Date().toISOString(),
          },
          ...old,
        ],
      );

      return { previousTodos };
    },
    onSettled: async () =>
      await queryClient.invalidateQueries({
        queryKey: ["posts", post.id, "comments"],
      }),
  });

  return (
    <Drawer>
      <DrawerTrigger className="text-left">
        <FaComment fontSize={25} />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col gap-3 p-3">
        <h5 className="text-center">{t("index.comments.title")}</h5>

        <div className="flex h-[33vh] max-h-[33vh] flex-col gap-3 overflow-y-auto">
          {data?.length === 0 && (
            <div className="flex size-full flex-col items-center justify-center">
              <h5>{t("general.empty")}</h5>
              <p className="muted text-center">
                {t("general.empty_description")}
              </p>
            </div>
          )}

          {data?.map((comment, index) => (
            <div key={index} className="flex items-start gap-3">
              <Link to={`/account/${comment.user.username}`}>
                <Avatar user={comment.user} width={40} height={40} />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/account/${comment.user.username}`}>
                    <h5 className="max-w-40 truncate">{comment.user.name}</h5>
                  </Link>
                  <p className="muted">{formatDistance(comment.createdAt)}</p>
                </div>

                <div className="flex max-w-72 gap-1 break-all leading-5">
                  {comment.text.split(" ").map((word, index) => {
                    if (word.startsWith("@")) {
                      return (
                        <Link
                          key={index}
                          to={`/account/${word}`}
                          className="text-primary"
                        >
                          {word}{" "}
                        </Link>
                      );
                    }
                    return word + " ";
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={
            "mt-auto flex gap-3" +
            (Capacitor.getPlatform() === "ios" ? " pb-4" : "")
          }
        >
          {session && (
            <Link
              to={`/account/${session?.username}`}
              className="block h-10 w-14"
            >
              <Avatar user={session} width={40} height={40} />
            </Link>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              comment.mutate(message.trim());
            }}
            className="w-full"
          >
            <Input
              placeholder={t("index.comments.placeholder")}
              className="bg-secondary"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              ref={input}
            />
          </form>
        </div>

        <Mentions
          message={message}
          setMessage={(message) => {
            setMessage(message);
            input.current?.focus();
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
