import { Message } from "@/types/prisma/models";
import { useTranslation } from "react-i18next";
import { ContextMenuContent, ContextMenuItem } from "../ui/context-menu";

export default function Menu({
  websocket,
  message,
  setEditing,
  setReplying,
  song,
}: {
  websocket: WebSocket | null;
  message: Message;
  setEditing: (messageId: string) => void;
  setReplying: (messageId: string) => void;
  song?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <ContextMenuContent>
      {!song && (
        <>
          <ContextMenuItem onClick={() => setReplying(message.id)}>
            {t("dm.reply")}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              setEditing(message.id);
            }}
          >
            {t("dm.edit")}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => navigator.clipboard.writeText(message.text)}
          >
            {t("dm.copy")}
          </ContextMenuItem>
        </>
      )}
      <ContextMenuItem
        className="bg-destructive"
        onClick={() => {
          websocket?.send("-" + message.id);
        }}
      >
        Delete
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
