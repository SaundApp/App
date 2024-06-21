export enum NotificationType {
  LIKE,
  COMMENT,
  FOLLOW,
  FOLLOW_REQUEST, // TODO
  MENTION, // TODO
  DM,
  LEADERBOARD, // TODO
  POST, // TODO
}

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, string>
) {
  // TODO
}
