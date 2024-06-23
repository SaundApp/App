import { axiosClient } from "@/lib/axios";
import { Attachment as AttachmentType, Message } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
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
        <div
          className={
            "daisy-chat " + (self ? "daisy-chat-end" : "daisy-chat-start")
          }
          data-message={message.id}
        >
          <div
            className={
              "daisy-chat-bubble text-white max-w-72 break-all !p-3 " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <video
              className="rounded-2xl max-w-64 max-h-64"
              draggable={false}
              controls
            >
              <source
                src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
              />
            </video>
          </div>
          <time className="daisy-chat-footer muted">
            {moment(message.createdAt).format("hh:mm")}
          </time>
        </div>
      );

    if (data.type === "IMAGE")
      return (
        <div
          className={
            "daisy-chat " + (self ? "daisy-chat-end" : "daisy-chat-start")
          }
          data-message={message.id}
        >
          <div
            className={
              "daisy-chat-bubble text-white max-w-72 break-all !p-3 " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <img
              className="rounded-2xl max-w-64 max-h-64"
              src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
              alt="Attachment"
              draggable={false}
            />
          </div>
          <time className="daisy-chat-footer muted">
            {moment(message.createdAt).format("hh:mm")}
          </time>
        </div>
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
        <div data-message={message.id}>{renderItem()}</div>
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
