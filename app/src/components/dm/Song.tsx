import { axiosClient } from "@/lib/axios";
import { Message, Post } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SiSpotify } from "react-icons/si";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import Menu from "./Menu";

export default function Song({
  postId,
  self,
  websocket,
  message,
  setEditing,
  setReplying,
}: {
  postId: string;
  self: boolean;
  websocket: WebSocket | null;
  message: Message;
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
}) {
  const { data: post } = useQuery<Post>({
    queryKey: ["posts", postId],
    queryFn: () => axiosClient.get(`/posts/${postId}`).then((res) => res.data),
  });

  if (!post) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger className={self ? "ml-auto" : ""} disabled={!self}>
        <img
          className="rounded-t-md w-64 h-64"
          src={post.image}
          alt={post.name}
          draggable={false}
        />
        <div className="bg-secondary rounded-b-md p-3">
          <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {post.name}
          </h5>
          <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {post.user.name}
          </p>

          <div className="flex gap-3 justify-end">
            {post.url && (
              <Link to={post.url} target="_blank">
                <SiSpotify fontSize={25} />
              </Link>
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <Menu
        websocket={websocket}
        message={message}
        setEditing={setEditing}
        setReplying={setReplying}
        song
      />
    </ContextMenu>
  );
}
