import { firebase, getMessage, prisma } from ".";

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
      notificationSettings: true,
      language: true,
    },
  });

  const settings = user?.notificationSettings[type];
  if (!settings?.length) return;
  if (user?.notificationSettings.mutedChats.includes(data.chatId)) return;

  let message = getMessage(type, user?.language);
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

  if (
    type === NotificationType.DM &&
    data.message?.startsWith(process.env.FRONTEND_URL!)
  ) {
    message = getMessage("attachment", user?.language);
  }

  if (settings.includes("APP")) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        text: message,
        involvedUser,
      },
    });

    if (type === NotificationType.FOLLOW_REQUEST) {
      const button = {
        text: getMessage("accept", user?.language),
        href: `/users/requests/accept?id=${data.requestId}&notificationId=${notification.id}`,
      };

      await prisma.notification.update({
        where: { id: notification.id },
        data: { button },
      });

      await prisma.followRequest.update({
        where: { id: data.requestId },
        data: { notificationId: notification.id },
      });
    }
  }

  if (settings.includes("EMAIL")) {
    // TODO: send email
  }

  if (!user?.notificationToken || !settings.includes("PUSH")) return;

  firebase
    ?.messaging()
    .send({
      token: user.notificationToken,
      notification: {
        title: data.user ? data.user : message,
        body: data.user ? message : undefined,
      },
    })
    .catch();
}
