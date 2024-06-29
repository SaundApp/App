import { useDate } from "@/lib/dates";
import type { Message } from "@repo/backend-common/types";
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
  const { format } = useDate();

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
          <div className={"flex w-fit gap-1 " + (self ? "ml-auto" : "")}>
            <div className="flex items-center gap-1">
              <span
                className="muted"
                onClick={() => {
                  document
                    .querySelector(`[data-message="${reply.id}"]`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("dm.replying", {
                  message: reply.text.startsWith(
                    `${import.meta.env.VITE_APP_URL}/`,
                  )
                    ? t("dm.attachment")
                    : reply.text,
                })}
              </span>
            </div>
          </div>
        )}

        <div
          className={
            "daisy-chat " + (self ? "daisy-chat-end" : "daisy-chat-start")
          }
          data-message={message.id}
        >
          <div
            className={
              "!dark:text-white daisy-chat-bubble max-w-72 break-words !p-3 " +
              (self ? "bg-primary text-white" : "bg-secondary text-foreground")
            }
          >
            {message.text}
          </div>
          <time className="muted daisy-chat-footer">
            {format(message.createdAt, "kk:mm")}
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
