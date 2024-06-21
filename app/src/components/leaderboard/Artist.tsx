import { User } from "@/types/prisma/models";
import { Link } from "@tanstack/react-router";
import Avatar from "../account/Avatar";

export default function Artist({
  user,
  position,
  description,
  onClick,
}: {
  user: User;
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
        <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
          {user.name}
        </h5>
        {description && (
          <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {description}
          </p>
        )}
      </div>
      {position && <p className="ml-auto">{position}°</p>}
    </Link>
  );
}
