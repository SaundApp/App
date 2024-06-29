import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.saund",
  appName: "Saund",
  webDir: "dist",
  server: {
    allowNavigation: ["api.saund.app", "ws.saund.app"],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: false,
    },
    Keyboard: {
      resize: "body"
    }
  },
};

export default config;
