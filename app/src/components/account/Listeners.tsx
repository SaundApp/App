import { useTranslation } from "react-i18next";
import type { PublicUser } from "@/types/prisma";
import Artist from "../leaderboard/Artist";

export default function Listeners({ listeners }: { listeners: PublicUser[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 h-full max-h-[60vh] overflow-y-auto">
      {listeners.length === 0 && (
        <p className="muted text-center">{t("general.empty")}</p>
      )}
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
