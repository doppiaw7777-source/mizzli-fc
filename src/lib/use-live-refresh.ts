"use client";

import { useEffect } from "react";
import { useTeam } from "@/context/TeamContext";
import type { LiveStatus } from "@/lib/types";

export function useLiveRefresh(status?: LiveStatus | null, ms = 8000) {
  const { refresh } = useTeam();

  useEffect(() => {
    if (status !== "live" && status !== "ht") return;
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const id = window.setInterval(tick, ms);
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [status, refresh, ms]);
}
