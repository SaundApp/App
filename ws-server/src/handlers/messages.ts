import {
  NotificationType,
  prisma,
  sendNotification,
} from "@repo/backend-common";

export async function handleDelete(
  message: string,
  user: string,
  chat: string
) {
  const result = await prisma.message.findFirst({
    where: {
      id: message,
      senderId: user,
      chatId: chat,
    },
  });

  if (!result) return false;

  await prisma.message.delete({
    where: {
      id: message,
    },
  });

  return true;
}

export async function handleEdit(
  messageId: string,
  user: string,
  chat: string,
  text: string
) {
  try {
    const result = await prisma.message.update({
      where: {
        id: messageId,
        senderId: user,
        chatId: chat,
      },
      data: {
        text,
      },
    });

    if (result) return true;
  } catch (e) {}

  return false;
}

export async function handleReply(
  message: string,
  senderId: string,
  chatId: string,
  originId: string
) {
  const origin = await prisma.message.findUnique({
    where: {
      id: originId,
      chatId,
    },
  });

  if (!origin) return;

  return await handleSend(message, senderId, chatId, originId);
}

export async function handleSend(
  message: string,
  senderId: string,
  chatId: string,
  replyId?: string
) {
  const result = await prisma.message.create({
    data: {
      text: message,
      senderId: senderId,
      chatId,
      replyId,
    },
  });

  const sender = await prisma.user.findUnique({
    where: {
      id: senderId,
    },
    select: {
      username: true,
    },
  });

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  for (const member of chat!.userIds) {
    sendNotification(member, NotificationType.DM, {
      user: sender!.username,
      userId: senderId,
      message,
      chatId
    });
  }

  return result;
}
