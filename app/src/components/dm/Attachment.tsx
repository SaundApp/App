import { axiosClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type {
  Attachment as AttachmentType,
  Message,
} from "backend-common/types";
import { format } from "date-fns";
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
              "daisy-chat-bubble max-w-72 break-all !p-3 text-white " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <video
              className="max-h-64 max-w-64 rounded-2xl"
              draggable={false}
              controls
            >
              <source
                src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
              />
            </video>
          </div>
          <time className="muted daisy-chat-footer">
            {format(message.createdAt, "hh:mm")}
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
              "daisy-chat-bubble max-w-72 break-all !p-3 text-white " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <img
              className="max-h-64 max-w-64 rounded-2xl"
              src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
              alt="Attachment"
              draggable={false}
            />
          </div>
          <time className="muted daisy-chat-footer">
            {format(message.createdAt, "hh:mm")}
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
