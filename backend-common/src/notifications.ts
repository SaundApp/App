import { WithButton, WithText, render } from "@repo/email";
import nodemailer from "nodemailer";
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

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail(email: string, subject: string, html: string) {
  return await transporter.sendMail({
    from: '"Saund" <team@saund.app>',
    to: email,
    subject,
    html,
  });
}

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, string>,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      notificationTokens: true,
      notificationSettings: true,
      language: true,
      email: true,
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
    (data.message?.startsWith(process.env.FRONTEND_URL!) ||
      data.message?.startsWith("https://saund.app"))
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

  if (settings.includes("EMAIL") && user?.email) {
    const newNotification = getMessage("new-notification", user?.language);
    const html = await render(
      WithText({
        preview: newNotification,
        heading: newNotification,
        text: message,
      }),
    );

    sendMail(user.email, newNotification, html).catch();
  }

  if (!user?.notificationTokens || !settings.includes("PUSH")) return;

  for (const token of user.notificationTokens)
    firebase
      ?.messaging()
      .send({
        token: token,
        notification: {
          title: data.user ? data.user : message,
          body: data.user ? message : undefined,
        },
      })
      .catch();
}

export async function sendForgotPassword(
  email: string,
  token: string,
  language?: string,
) {
  const heading = getMessage("forgot-password.heading", language);
  const button = getMessage("forgot-password.button", language);

  const html = await render(
    WithButton({
      preview: heading,
      heading: heading,
      button,
      href: `${process.env.FRONTEND_URL}/password/reset?token=${token}&email=${email}`,
    }),
  );

  return await sendMail(email, heading, html);
}
