import { Message } from "@/types/prisma/models";
import moment from "moment";
import { useTranslation } from "react-i18next";
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
  reply,
}: {
  message: Message;
  self: boolean;
  websocket: WebSocket | null;
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
  reply: Message | undefined;
}) {
  const { t } = useTranslation();

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
      <ContextMenuTrigger disabled={!self}>
        {reply && (
          <div className={"flex gap-1 w-fit " + (self ? "ml-auto" : "")}>
            <div className="flex items-center gap-1">
              <span className="muted">{t("dm.message.reply")}</span>
            </div>

            <span
              className="muted !text-primary font-semibold max-w-[3rem] text-ellipsis whitespace-nowrap overflow-hidden"
              onClick={() => {
                document
                  .querySelector(`[data-message="${reply.id}"]`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {reply.text.startsWith(`${import.meta.env.VITE_APP_URL}/`)
                ? t("dm.message.attachment")
                : reply.text}
            </span>
          </div>
        )}

        <div
          className={"daisy-chat " + (self ? "daisy-chat-end" : "daisy-chat-start")}
          data-message={message.id}
        >
          <div
            className={
              "daisy-chat-bubble text-white max-w-72 break-all " +
              (self ? "bg-primary" : "bg-secondary")
            }
          >
            {message.text}
          </div>
          <time className="daisy-chat-footer muted">
            {moment(message.createdAt).format("hh:mm")}
          </time>
        </div>
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
