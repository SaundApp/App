import firebase from "./firebase";
import prisma from "./prisma";
import { getMessage } from "./translations";

export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  FOLLOW = "follow",
  FOLLOW_REQUEST = "follow_request", // TODO
  MENTION = "mention",
  DM = "dm",
  LEADERBOARD = "leaderboard", // TODO
  POST = "post", // TODO
}

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, string>
) {
  await prisma.notification.create({
    data: {
      userId,
      text: JSON.stringify({
        type,
        data,
      }),
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      notificationToken: true,
    },
  });

  if (!user?.notificationToken) return;

  let message = getMessage(type);
  for (const key in data) {
    message = message.replace(`{${key}}`, data[key]);
  }

  await firebase?.messaging().send({
    token: user.notificationToken,
    notification: {
      title: data.user ? data.user : message,
      body: data.user ? message : undefined,
    },
  });
}
