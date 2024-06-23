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
      className="flex flex-row gap-3 w-full items-center"
      onClick={onClick}
    >
      <Avatar user={user} width={40} height={40} />
      <div>
        <h5 className="max-w-[10rem] text-left text-ellipsis whitespace-nowrap overflow-hidden">
          {user.name}
        </h5>
        {description && (
          <p className="muted max-w-[10rem] text-left text-ellipsis whitespace-nowrap overflow-hidden">
            {description}
          </p>
        )}
      </div>
      {position && <p className="ml-auto">{position}°</p>}
    </Link>
  );
}
