import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@saundapp/keyboard";

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
      androidScaleType: "CENTER_CROP",
    },
    Keyboard: {
      resize: KeyboardResize.Native,
    },
  },
};

export default config;
