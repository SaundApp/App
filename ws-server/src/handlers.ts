import { prisma } from "@repo/backend-common";

export async function handleDelete(
  message: string,
  user: string,
  target: string
) {
  const result = await prisma.message.findFirst({
    where: {
      id: message,
      senderId: user,
      receiver: {
        username: target,
      },
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
  message: string,
  user: string,
  target: string
) {
  const id = message.slice(0, 24);
  const text = message.slice(24);

  if (!id || !text) return;

  try {
    const result = await prisma.message.update({
      where: {
        id,
        senderId: user,
        receiver: {
          username: target,
        },
      },
      data: {
        text,
      },
    });

    if (result) return true;
  } catch (e) {}

  return false;
}
