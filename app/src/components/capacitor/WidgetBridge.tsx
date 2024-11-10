import { axiosClient } from "@/lib/axios";
import type { User } from "@repo/backend-common/types";
import { WidgetsBridge } from "@saundapp/widgetsbridge";

export async function syncLeaderboard() {
  const data = await axiosClient
    .get<User[]>(`/leaderboards/artists`)
    .then((res) => res.data);

  await WidgetsBridge.setItem({
    key: "leaderboard.artists",
    value: JSON.stringify(data),
    group: "group.app.saund",
  });

  await WidgetsBridge.reloadTimeline({ kind: "LeaderboardWidget" });
}
