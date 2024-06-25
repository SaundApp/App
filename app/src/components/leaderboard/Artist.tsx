import { Link } from "@tanstack/react-router";
import Avatar from "../account/Avatar";
import type { PublicUser } from "@/types/prisma";

export default function Artist({
  user,
  position,
  description,
  onClick,
}: {
  user: PublicUser;
  position?: number;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={`/account/${user.username}`}
      className="flex w-full flex-row items-center gap-3"
      onClick={onClick}
    >
      <Avatar user={user} width={40} height={40} />
      <div>
        <h5 className="max-w-40 truncate text-left">
          {user.name}
        </h5>
        {description && (
          <p className="muted max-w-40 truncate text-left">
            {description}
          </p>
        )}
      </div>
      {position && <p className="ml-auto">{position}°</p>}
    </Link>
  );
}
