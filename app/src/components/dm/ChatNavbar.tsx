import type { Chat } from "@repo/backend-common/types";
import { Link } from "@tanstack/react-router";
import { useSession } from "../SessionContext";
import Avatar from "../account/Avatar";
import BackIcon from "../BackIcon";

export default function ChatNavbar({
  chat,
  hideLogo,
}: {
  chat: Chat | undefined;
  hideLogo?: boolean;
}) {
  const session = useSession();

  return (
    <div className="relative flex items-center gap-3">
      <BackIcon className="absolute left-0 mr-0" />

      <Link
        className={"flex items-center gap-3 " + (hideLogo ? "m-auto" : "ml-8")}
        to={chat?.ownerId === session?.id ? "/dm/$id/settings" : undefined}
        params={{ id: chat?.id ?? "" }}
      >
        {chat && !hideLogo && (
          <Avatar imageId={chat.imageId} width={40} height={40} />
        )}

        <div>
          <h5 className="max-w-40 truncate text-left">{chat?.name}</h5>
        </div>
      </Link>
    </div>
  );
}
