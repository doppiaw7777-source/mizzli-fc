"use client";

import { useEffect, useRef } from "react";

const SRC =
  "/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";

export default function ThemeLoopVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const play = () => {
      const p = el.play();
      if (p) p.catch(() => {});
    };
    play();
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <video
      ref={ref}
      className="theme-video"
      src={SRC}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}
