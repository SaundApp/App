import { Link } from "@tanstack/react-router";

// TODO: Leaderboard
export default function Artist({ user, position, streams }: any) {
  return (
    <Link className="flex flex-row gap-3 w-full items-center">
      <img
        src={user.avatar}
        alt={user.name}
        draggable={false}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <h4>{user.name}</h4>
        <p className="muted">{streams} streams</p>
      </div>
      {position && <p className="ml-auto">{position}°</p>}
    </Link>
  );
}
