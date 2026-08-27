"use client";

import { useEffect, useState } from "react";
import { initNativeShell, isNativeApp } from "@/lib/native";
import { installClickSounds } from "@/lib/sound";
import { NotifyCenter } from "@/components/NotifyCenter";

export default function NativeBootstrap() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    initNativeShell();
    const stopSounds = installClickSounds();
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => reg.update())
        .catch(() => {});
    }

    let remove: (() => void) | undefined;

    async function setupNetwork() {
      if (await isNativeApp()) {
        const { Network } = await import("@capacitor/network");
        const status = await Network.getStatus();
        setOffline(!status.connected);
        const handle = await Network.addListener("networkStatusChange", (s) => {
          setOffline(!s.connected);
        });
        remove = () => {
          handle.remove();
        };
        return;
      }

      const onOnline = () => setOffline(false);
      const onOffline = () => setOffline(true);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      setOffline(!navigator.onLine);
      remove = () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }

    setupNetwork();
    return () => {
      stopSounds();
      remove?.();
    };
  }, []);

  return (
    <>
      <NotifyCenter />
      {offline ? (
        <div className="fixed left-0 right-0 top-[env(safe-area-inset-top)] z-[80] bg-red-700 px-4 py-2 text-center text-sm font-semibold">
          Sei offline. Alcune funzioni non sono disponibili.
        </div>
      ) : null}
    </>
  );
}
