import firebase from "./firebase";
import prisma from "./prisma";
import { getMessage } from "./translations";

export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  FOLLOW = "follow",
  FOLLOW_REQUEST = "follow_request",
  MENTION = "mention",
  DM = "dm",
  LEADERBOARD = "leaderboard",
  POST = "post",
}

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, string>
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      notificationToken: true,
    },
  });

  let message = getMessage(type);
  for (const key in data) {
    message = message.replace(`{${key}}`, data[key]);
  }

  let involvedUser;
  if (data.user) {
    involvedUser = (
      await prisma.user.findUnique({
        where: { username: data.user },
        select: { id: true },
      })
    )?.id;
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      text: message,
      involvedUser,
    },
  });

  if (type === NotificationType.FOLLOW_REQUEST) {
    const button = {
      text: getMessage("accept"),
      href: `/users/requests/accept?id=${data.requestId}&notificationId=${notification.id}`,
    };

    await prisma.notification.update({
      where: { id: notification.id },
      data: { button },
    });
  }

  if (!user?.notificationToken) return;

  await firebase?.messaging().send({
    token: user.notificationToken,
    notification: {
      title: data.user ? data.user : message,
      body: data.user ? message : undefined,
    },
  });
}
