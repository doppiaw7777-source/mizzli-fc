"use client";

import { useEffect, useRef } from "react";

const SRC =
  "/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";
const SRC_FALLBACK =
  "https://raw.githubusercontent.com/doppiaw7777-source/mizzli-fc/main/public/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";

const FADE = 1.8;
const LEAD = 0.12;

export default function ThemeLoopVideo() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const front = useRef<"a" | "b">("a");
  const swapping = useRef(false);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    const veil = veilRef.current;
    if (!a || !b) return;

    const setOp = (el: HTMLVideoElement, v: number) => {
      el.style.opacity = String(v);
    };

    const swap = async () => {
      if (swapping.current) return;
      swapping.current = true;
      const from = front.current === "a" ? a : b;
      const to = front.current === "a" ? b : a;
      try {
        to.currentTime = LEAD;
        await to.play();
      } catch {
        /* ignore */
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (FADE * 1000));
        const ease = t * t * (3 - 2 * t);
        setOp(to, ease);
        setOp(from, 1 - ease);
        if (veil) veil.style.opacity = String(0.22 * Math.sin(Math.PI * t));
        if (t < 1) {
          requestAnimationFrame(tick);
          return;
        }
        from.pause();
        if (veil) veil.style.opacity = "0";
        front.current = front.current === "a" ? "b" : "a";
        swapping.current = false;
      };
      requestAnimationFrame(tick);
    };

    const onTime = () => {
      const v = front.current === "a" ? a : b;
      if (!v.duration || Number.isNaN(v.duration)) return;
      if (v.duration - v.currentTime <= FADE) void swap();
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
        style={{ opacity: 1 }}
      >
        <source src={SRC} type="video/mp4" />
        <source src={SRC_FALLBACK} type="video/mp4" />
      </video>
      <video
        ref={bRef}
        className="theme-video"
        muted
        playsInline
        preload="auto"
        aria-hidden
        style={{ opacity: 0 }}
      >
        <source src={SRC} type="video/mp4" />
        <source src={SRC_FALLBACK} type="video/mp4" />
      </video>
      <div
        ref={veilRef}
        className="theme-video"
        aria-hidden
        style={{
          background: "#07030c",
          opacity: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
