import { axiosClient } from "@/lib/axios";
import { useDate } from "@/lib/dates";
import type { ExtendedPost, PublicUser } from "@/types/prisma";
import type { Message } from "@repo/backend-common/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SiSpotify } from "react-icons/si";
import type { Socket } from "socket.io-client";
import Avatar from "../account/Avatar";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import Menu from "./Menu";

export default function Song({
  postId,
  chatSize,
  self,
  socket,
  message,
  setEditing,
  setReplying,
}: {
  postId: string;
  chatSize: number;
  self: boolean;
  socket: Socket | null;
  message: Message & {
    sender: PublicUser;
  };
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
}) {
  const { format } = useDate();
  const { data: post } = useQuery<ExtendedPost>({
    queryKey: ["posts", postId],
    queryFn: () => axiosClient.get(`/posts/${postId}`).then((res) => res.data),
  });

  if (!post) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger className={self ? "ml-auto" : ""} disabled={!self}>
        <div
          className={
            "daisy-chat " + (self ? "daisy-chat-end" : "daisy-chat-start")
          }
          data-message={message.id}
        >
          {chatSize > 2 && (
            <div className="daisy-avatar daisy-chat-image">
              <div className="w-10 rounded-full">
                <Avatar
                  imageId={message.sender.avatarId ?? undefined}
                  width={40}
                  height={40}
                />
              </div>
            </div>
          )}

          <div
            className={
              "daisy-chat-bubble max-w-72 break-words !p-3 text-white " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <img
              className="size-64 rounded-2xl"
              src={post.image}
              alt={post.name}
              draggable={false}
            />

            <div className="pt-3">
              <h5 className="max-w-40 truncate">{post.name}</h5>
              <Link
                to={`/account/${post.user.username}`}
                className="max-w-40 truncate text-sm"
              >
                {post.user.name}
              </Link>

              <div className="flex justify-end gap-3">
                {post.url && (
                  <Link to={post.url} target="_blank">
                    <SiSpotify fontSize={25} />
                  </Link>
                )}
              </div>
            </div>
          </div>
          <time className="muted daisy-chat-footer">
            {format(message.createdAt, "kk:mm")}
          </time>
        </div>
      </ContextMenuTrigger>

      <Menu
        socket={socket}
        message={message}
        setEditing={setEditing}
        setReplying={setReplying}
        song
      />
    </ContextMenu>
  );
}
