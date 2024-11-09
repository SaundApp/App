import { axiosClient } from "@/lib/axios";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";
import type { User } from "@repo/backend-common/types";

export async function syncLeaderboard() {
  const data = await axiosClient
    .get<User[]>(`/leaderboards/artists`)
    .then((res) => res.data);

  await WidgetsBridgePlugin.setItem({
    key: "leaderboard.artists",
    value: JSON.stringify(data),
    group: "group.app.saund",
  });

  await WidgetsBridgePlugin.reloadTimelines({ ofKind: "LeaderboardWidget" });
}
