"use client";

import { useEffect, useRef } from "react";

const THEME_VIDEO_LOCAL =
  "/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";
const THEME_VIDEO_REMOTE =
  "https://raw.githubusercontent.com/doppiaw7777-source/mizzli-fc/main/public/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";

const FADE = 0.42;

export default function ThemeLoopVideo() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const front = useRef<"a" | "b">("a");
  const swapping = useRef(false);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const show = (el: HTMLVideoElement, on: boolean) => {
      el.style.opacity = on ? "1" : "0";
    };

    const swap = async () => {
      if (swapping.current) return;
      swapping.current = true;
      const from = front.current === "a" ? a : b;
      const to = front.current === "a" ? b : a;
      try {
        to.currentTime = 0.04;
        await to.play();
      } catch {
        /* autoplay lock */
      }
      show(to, true);
      window.setTimeout(() => {
        show(from, false);
        from.pause();
        front.current = front.current === "a" ? "b" : "a";
        swapping.current = false;
      }, FADE * 1000);
    };

    const onTime = () => {
      const v = front.current === "a" ? a : b;
      if (!v.duration || Number.isNaN(v.duration)) return;
      if (v.duration - v.currentTime <= FADE + 0.05) void swap();
    };

    a.addEventListener("timeupdate", onTime);
    b.addEventListener("timeupdate", onTime);
    void a.play().catch(() => {});

    return () => {
      a.removeEventListener("timeupdate", onTime);
      b.removeEventListener("timeupdate", onTime);
    };
  }, []);

  return (
    <>
      <video
        ref={aRef}
        className="theme-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden
        style={{ opacity: 1, transition: `opacity ${FADE}s linear` }}
      >
        <source src={THEME_VIDEO_LOCAL} type="video/mp4" />
        <source src={THEME_VIDEO_REMOTE} type="video/mp4" />
      </video>
      <video
        ref={bRef}
        className="theme-video"
        muted
        playsInline
        preload="auto"
        aria-hidden
        style={{ opacity: 0, transition: `opacity ${FADE}s linear` }}
      >
        <source src={THEME_VIDEO_LOCAL} type="video/mp4" />
        <source src={THEME_VIDEO_REMOTE} type="video/mp4" />
      </video>
    </>
  );
}
