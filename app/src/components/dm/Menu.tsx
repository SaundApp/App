import type { Message } from "@repo/backend-common/types";
import { useTranslation } from "react-i18next";
import type { Socket } from "socket.io-client";
import { ContextMenuContent, ContextMenuItem } from "../ui/context-menu";

export default function Menu({
  socket,
  message,
  setEditing,
  setReplying,
  song,
}: {
  socket: Socket | null;
  message: Message;
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
  song?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => setReplying(message.id)}>
        {t("dm.reply")}
      </ContextMenuItem>
      {!song && (
        <>
          <ContextMenuItem
            className="!rounded-2xl"
            onClick={() => {
              setEditing(message.id);
            }}
          >
            {t("dm.edit")}
          </ContextMenuItem>
          <ContextMenuItem
            className="!rounded-2xl"
            onClick={() => navigator.clipboard.writeText(message.text)}
          >
            {t("dm.copy")}
          </ContextMenuItem>
        </>
      )}
      <ContextMenuItem
        className="!rounded-2xl bg-destructive"
        onClick={() => {
          socket?.emit("delete", message.id);
        }}
      >
        {t("dm.delete")}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
