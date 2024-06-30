import { Link } from "@tanstack/react-router";
import { FaChevronLeft } from "react-icons/fa";
import Avatar from "../account/Avatar";
import type { Chat } from "@repo/backend-common/types";

export default function ChatNavbar({ chat }: { chat: Chat | undefined }) {
  return (
    <div className="flex items-center gap-3">
      <Link to="/dm">
        <FaChevronLeft fontSize={25} />
      </Link>

      <Link className="flex items-center gap-3" to={`/dm/${chat?.id}/settings`}>
        {chat && <Avatar imageId={chat.imageId} width={40} height={40} />}

        <div>
          <h5 className="max-w-40 truncate text-left">{chat?.name}</h5>
        </div>
      </Link>
    </div>
  );
}
