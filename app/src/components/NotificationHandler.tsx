import { axiosClient } from "@/lib/axios";
import { PushNotifications } from "@capacitor/push-notifications";

export const addListeners = async () => {
  await PushNotifications.addListener("registration", (token) => {
    axiosClient.post("/notifications/register", { token: token.value });
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("Registration error: ", err.error);
  });
};

export const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") {
    throw new Error("User denied permissions!");
  }

  await PushNotifications.register();
};

export const clearNotifications = async () =>
  await PushNotifications.removeAllDeliveredNotifications();
