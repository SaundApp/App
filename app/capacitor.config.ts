import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.saund",
  appName: "Saund",
  webDir: "dist",
  server: {
    allowNavigation: ["10.0.2.2:8000", "10.0.2.2"],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;