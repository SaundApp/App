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
        className="bg-destructive !rounded-2xl"
        onClick={() => {
          websocket?.send("-" + message.id);
        }}
      >
        {t("dm.delete")}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
