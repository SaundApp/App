import { axiosClient } from "@/lib/axios";
import type {
  Attachment as AttachmentType,
  Message,
} from "@repo/backend-common/types";
import { useQuery } from "@tanstack/react-query";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import AudioPlayer from "./AudioPlayer";
import Menu from "./Menu";
import { useDate } from "@/lib/dates";
import { Spinner } from "../ui/spinner";

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
  message?: Message;
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
}) {
  const { format } = useDate();
  const { data } = useQuery<AttachmentType>({
    queryKey: ["attachments", postId],
    queryFn: async () => {
      if (postId.startsWith("local-")) return null;

      return await axiosClient
        .get("/attachments/" + postId + "/metadata")
        .then((res) => res.data);
    },
  });

  const renderItem = () => {
    if (!data && message) return null;

    if (data?.type === "VIDEO")
      return (
        <div
          className={
            "daisy-chat " +
            (self ? "daisy-chat-end" : "daisy-chat-start") +
            (!message ? " animate-pulse opacity-50" : "")
          }
          data-message={message?.id}
        >
          <div
            className={
              "daisy-chat-bubble max-w-72 break-words !p-3 text-white " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <video
              className="max-h-64 max-w-64 rounded-2xl"
              draggable={false}
              controls
            >
              <source
                src={
                  postId.startsWith("local-")
                    ? postId.split("-")[2]
                    : `${import.meta.env.VITE_API_URL}/attachments/` + postId
                }
              />
            </video>
          </div>
          {message && (
            <time className="muted daisy-chat-footer">
              {format(message.createdAt, "kk:mm")}
            </time>
          )}
        </div>
      );

    if (!data || data.type === "IMAGE")
      return (
        <div
          className={
            "daisy-chat " +
            (self ? "daisy-chat-end" : "daisy-chat-start") +
            (!message ? " relative opacity-50" : "")
          }
          data-message={message?.id}
        >
          <div
            className={
              "daisy-chat-bubble max-w-72 break-words !p-3 text-white " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            <img
              className="max-h-64 max-w-64 rounded-2xl"
              src={
                postId.startsWith("local-")
                  ? postId.split("-")[2]
                  : `${import.meta.env.VITE_API_URL}/attachments/` + postId
              }
              alt="Attachment"
              draggable={false}
            />
          </div>
          {message && (
            <time className="muted daisy-chat-footer">
              {format(message.createdAt, "kk:mm")}
            </time>
          )}
          {!data && (
            <Spinner className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      );

    if (!message) return null;

    return (
      <AudioPlayer
        src={`${import.meta.env.VITE_API_URL}/attachments/` + postId}
        message={message}
      />
    );
  };

  if (!message) return <div className="ml-auto">{renderItem()}</div>;

  return (
    <ContextMenu>
      <ContextMenuTrigger className={self ? "ml-auto" : ""} disabled={!self}>
        <div data-message={message?.id}>{renderItem()}</div>
      </ContextMenuTrigger>

      {message && (
        <Menu
          websocket={websocket}
          message={message}
          setEditing={setEditing}
          setReplying={setReplying}
          song
        />
      )}
    </ContextMenu>
  );
}
