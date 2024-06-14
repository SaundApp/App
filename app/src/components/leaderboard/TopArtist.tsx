import { Link } from "@tanstack/react-router";

// TODO: Leaderboard
export default function TopArtist({
  user,
  position,
  streams,
}: any) {
  return (
    <Link
      className={
        "flex flex-col items-center " + (position !== "🥇" ? "mt-20" : "")
      }
    >
      <div className="relative mb-3">
        <img
          src={user.avatar}
          alt={user.name}
          draggable={false}
          className="w-20 h-20 rounded-full"
        />
        <p className="absolute bottom-0 w-full text-center text-xl">
          {position}
        </p>
      </div>
      <h4>{user.name}</h4>
      <p className="muted">{streams} streams</p>
    </Link>
  );
}
