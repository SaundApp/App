import { User } from "@/types/prisma/models";
import Artist from "../leaderboard/Artist";

export default function Listeners({ listeners }: { listeners: User[] }) {
  return (
    <div className="flex flex-col gap-3 h-full max-h-[60vh] overflow-y-auto">
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
