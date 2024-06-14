import { Message } from "@/types/prisma/models";
import moment from "moment";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import Attachment from "./Attachment";
import Menu from "./Menu";
import Song from "./Song";

export default function MessageComponent({
  message,
  self,
  websocket,
  setEditing,
  setReplying,
}: {
  message: Message;
  self: boolean;
  websocket: WebSocket | null;
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
}) {
  if (message.text.startsWith(`${import.meta.env.VITE_APP_URL}/?attachment=`))
    return (
      <Attachment
        postId={message.text.split("=")[1]}
        self={self}
        websocket={websocket}
        message={message}
        setEditing={setEditing}
        setReplying={setReplying}
      />
    );
  if (message.text.startsWith(`${import.meta.env.VITE_APP_URL}/?post=`))
    return (
      <Song
        postId={message.text.split("=")[1]}
        self={self}
        websocket={websocket}
        message={message}
        setEditing={setEditing}
        setReplying={setReplying}
      />
    );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={!self}
        className={
          "relative flex justify-between items-center rounded-lg p-3 pb-4 w-fit min-w-36 max-w-72 text-pretty break-all " +
          (self ? "bg-primary ml-auto" : "bg-secondary")
        }
      >
        <p>{message.text}</p>
        <span className="absolute muted bottom-1 right-3">
          {moment(message.createdAt).format("hh:mm")}
        </span>
      </ContextMenuTrigger>

      <Menu
        websocket={websocket}
        message={message}
        setEditing={setEditing}
        setReplying={setReplying}
      />
    </ContextMenu>
  );
}
