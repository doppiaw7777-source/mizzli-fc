export async function isNativeApp() {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function initNativeShell() {
  if (!(await isNativeApp())) return;

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { Keyboard } = await import("@capacitor/keyboard");
    const { App } = await import("@capacitor/app");

    await StatusBar.setStyle({ style: Style.Dark });
    await SplashScreen.hide();
    await Keyboard.setAccessoryBarVisible({ isVisible: true });

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      }
    });
  } catch {
    // Native APIs are optional on web preview
  }
}

export async function hapticLight() {
  if (!(await isNativeApp())) return;
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  await Haptics.impact({ style: ImpactStyle.Light });
}

export async function shareText(title: string, text: string) {
  const native = await isNativeApp();
  if (native) {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title, text, dialogTitle: title });
    return;
  }

  if (navigator.share) {
    await navigator.share({ title, text });
  } else {
    await navigator.clipboard.writeText(text);
    alert("Testo copiato");
  }
}

export async function pickNativeImage(): Promise<File | null> {
  if (!(await isNativeApp())) return null;

  const { Camera, CameraSource, CameraResultType } = await import(
    "@capacitor/camera"
  );
  const photo = await Camera.getPhoto({
    quality: 80,
    source: CameraSource.Prompt,
    resultType: CameraResultType.Uri,
    promptLabelHeader: "Foto squadra",
    promptLabelPhoto: "Galleria",
    promptLabelPicture: "Scatta foto",
    promptLabelCancel: "Annulla",
  });

  if (!photo.webPath) return null;
  const response = await fetch(photo.webPath);
  const blob = await response.blob();
  const name = `foto-${Date.now()}.${photo.format || "jpeg"}`;
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
