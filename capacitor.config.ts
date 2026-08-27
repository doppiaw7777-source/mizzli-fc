import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://mizzlifc.it";

const config: CapacitorConfig = {
  appId: "com.noldi.fcunited",
  appName: "MIZZLI FC",
  webDir: "www",
  backgroundColor: "#0d4f2b",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "NoldiUnited",
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#0d4f2b",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d4f2b",
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    Camera: {
      presentationStyle: "popover",
    },
  },
};

if (serverUrl) {
  config.server = {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    allowNavigation: [
      new URL(serverUrl).hostname,
      "mizzlifc.it",
      "www.mizzlifc.it",
    ],
  };
}

export default config;
