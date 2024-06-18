import { axiosClient } from "@/lib/axios";
import { Attachment as AttachmentType, Message } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import AudioPlayer from "./AudioPlayer";
import Menu from "./Menu";

export default function Attachment({
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
  const [zoom, setZoom] = useState(false);
  const { data } = useQuery<AttachmentType>({
    queryKey: ["attachments", postId],
    queryFn: async () =>
      axiosClient
        .get("/attachments/" + postId + "/metadata")
        .then((res) => res.data),
  });

  const renderItem = () => {
    if (!data) return null;

    if (data.type === "VIDEO")
      return (
        <video
          className="rounded-2xl max-w-64 max-h-64"
          draggable={false}
          controls
        >
          <source
            src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
          />
        </video>
      );

    if (data.type === "IMAGE")
      return (
        <img
          className="rounded-2xl max-w-64 max-h-64"
          src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
          alt={"Attachment"}
          draggable={false}
        />
      );

    return (
      <AudioPlayer
        src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
        message={message}
      />
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className={self ? "ml-auto" : ""} disabled={!self}>
        <div
          onClick={() => {
            setZoom(true);
          }}
          data-message={message.id}
        >
          {renderItem()}
        </div>

        {zoom &&
          data?.type === "IMAGE" &&
          createPortal(
            <div
              onClick={() => setZoom(false)}
              className="flex h-screen w-screen justify-center items-center top-0 left-0 absolute bg-black/80"
            >
              {renderItem()}
            </div>,
            document.body
          )}
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
