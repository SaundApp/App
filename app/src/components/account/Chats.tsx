import type { Chat as ChatType } from "@repo/backend-common/types";
import Chat from "../dm/Chat";
import { useTranslation } from "react-i18next";
import { useSession } from "../SessionContext";

export default function Chats({ chats }: { chats: ChatType[] }) {
  const { t } = useTranslation();
  const session = useSession();

  return (
    <div className="flex h-full max-h-[60vh] flex-col gap-3 overflow-y-auto">
      {chats?.length === 0 && (
        <div className="flex size-full flex-col items-center justify-center">
          <h5>{t("general.empty")}</h5>
          <p className="muted text-center">{t("general.empty_description")}</p>
        </div>
      )}

      {chats.map((chat) => (
        <Chat
          key={chat.id}
          chat={chat}
          read
          join={session?.id ? chat.userIds.includes(session.id) : false}
        />
      ))}
    </div>
  );
}
