import type { PublicUser } from "@/types/prisma";
import Artist from "../leaderboard/Artist";

export default function Listeners({ listeners }: { listeners: PublicUser[] }) {
  return (
    <div className="flex h-full max-h-[60vh] flex-col gap-3 overflow-y-auto">
      {listeners.map((listener, i) => (
        <Artist
          key={listener.id}
          user={listener}
          position={i + 1}
          description={"@" + listener.username}
        />
      ))}
    </div>
  );
}
