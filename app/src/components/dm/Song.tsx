import { axiosClient } from "@/lib/axios";
import { Message, Post } from "@/types/prisma/models";
import { Album } from "@spotify/web-api-ts-sdk";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SiAmazonmusic, SiApplemusic, SiSpotify } from "react-icons/si";
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
  const { data: song } = useQuery<Album | null>({
    queryKey: ["songs", post?.id],
    queryFn: () =>
      post
        ? axiosClient
            .get(`/songs/${post.urls.spotify.split("/")[4]}?type=album`)
            .then((res) => res.data)
        : null,
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
          <h4 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {song?.name}
          </h4>
          <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {post.user.name}
          </p>

          <div className="flex gap-3 justify-end">
            {post.urls?.spotify && (
              <Link to={post.urls.spotify} target="_blank">
                <SiSpotify fontSize={25} />
              </Link>
            )}
            {post.urls?.amazon && (
              <Link to={post.urls.amazon} target="_blank">
                <SiAmazonmusic fontSize={25} />
              </Link>
            )}
            {post.urls?.apple && (
              <Link to={post.urls.apple} target="_blank">
                <SiApplemusic fontSize={25} />
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
