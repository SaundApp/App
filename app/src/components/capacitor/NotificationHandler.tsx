import { axiosClient } from "@/lib/axios";
import { PushNotifications } from "@capacitor/push-notifications";

const addListeners = async () => {
  await PushNotifications.addListener("registration", (token) => {
    axiosClient.post("/notifications/register", { token: token.value });
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("Registration error: ", err.error);
  });

  await PushNotifications.addListener("pushNotificationActionPerformed", () => {
    window.location.href = "/notifications";
  });
};

export const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") return;

  await PushNotifications.register();
  await addListeners();
};

export const clearNotifications = async () => {
  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch (e) {
    console.error("Failed to clear notifications", e);
  }
};
