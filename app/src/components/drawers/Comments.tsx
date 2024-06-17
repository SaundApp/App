import { axiosClient } from "@/lib/axios";
import { Comment, Post } from "@/types/prisma/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import moment from "moment/min/moment-with-locales";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaComment } from "react-icons/fa";
import Avatar from "../account/Avatar";
import Mentions from "../dropdown/Mentions";
import { useSession } from "../SessionContext";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Input } from "../ui/input";

export default function Comments({ post }: { post: Post }) {
  const { t, i18n } = useTranslation();
  const session = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  const { data } = useQuery<Comment[]>({
    queryKey: ["posts", post.id, "comments"],
    queryFn: () =>
      axiosClient.get(`/posts/${post.id}/comments`).then((res) => res.data),
  });
  const comment = useMutation({
    mutationFn: () =>
      axiosClient.post(`/posts/${post.id}/comment`, { text: message }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["posts", post.id, "comments"],
      });
    },
  });

  return (
    <Drawer>
      <DrawerTrigger className="text-left">
        <FaComment fontSize={25} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3">
        <h5 className="font-semibold text-center">
          {t("post.comments.title")}
        </h5>

        <div className="flex flex-col gap-3 h-[33vh] max-h-[33vh] overflow-y-auto">
          {data?.length === 0 && (
            <p className="muted">{t("post.comments.empty")}</p>
          )}

          {data?.map((comment, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Link to={`/account/${comment.user.username}`}>
                <Avatar user={comment.user} width={40} height={40} />
              </Link>

              <div>
                <div className="flex items-center gap-1">
                  <Link to={`/account/${comment.user.username}`}>
                    <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
                      {comment.user.name}
                    </h5>
                  </Link>
                  <p className="muted">{moment(comment.createdAt).fromNow()}</p>
                </div>

                <p>
                  {comment.text.split(" ").map((word, index) => {
                    if (word.startsWith("@")) {
                      return (
                        <Link
                          key={index}
                          to={`/account/${word}`}
                          className="text-blue-400"
                        >
                          {word}{" "}
                        </Link>
                      );
                    }
                    return <span key={index}>{word} </span>;
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-auto">
          {session && (
            <Link to={`/account/${session?.username}`}>
              <Avatar user={session} width={40} height={40} />
            </Link>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              comment.mutate();
            }}
            className="w-full"
          >
            <Input
              placeholder={t("post.comments.placeholder")}
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
