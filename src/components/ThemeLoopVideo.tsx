"use client";

import { useEffect, useRef } from "react";

const SRC =
  "/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";
const SRC_FALLBACK =
  "https://raw.githubusercontent.com/doppiaw7777-source/mizzli-fc/main/public/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";

const FADE = 1.6;
const LEAD = 0.08;

export default function ThemeLoopVideo() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const front = useRef<"a" | "b">("a");
  const swapping = useRef(false);
  const readyB = useRef(false);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    const veil = veilRef.current;
    if (!a || !b) return;

    const useSrc = (el: HTMLVideoElement, src: string) => {
      if (el.getAttribute("data-src") === src) return;
      el.setAttribute("data-src", src);
      el.src = src;
      el.load();
    };

    useSrc(a, SRC);

    const tryPlay = (el: HTMLVideoElement) => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const onError = (el: HTMLVideoElement) => {
      if (el.getAttribute("data-src") !== SRC_FALLBACK) {
        useSrc(el, SRC_FALLBACK);
        tryPlay(el);
      }
    };

    const swap = async () => {
      if (swapping.current) return;
      if (!readyB.current) {
        useSrc(b, a.getAttribute("data-src") || SRC);
        readyB.current = true;
      }
      swapping.current = true;
      const from = front.current === "a" ? a : b;
      const to = front.current === "a" ? b : a;
      try {
        if (to.readyState < 2) to.load();
        to.currentTime = LEAD;
        await to.play();
      } catch {
        swapping.current = false;
        from.currentTime = LEAD;
        tryPlay(from);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (FADE * 1000));
        const ease = t * t * (3 - 2 * t);
        to.style.opacity = String(ease);
        from.style.opacity = String(1 - ease);
        if (veil) veil.style.opacity = String(0.18 * Math.sin(Math.PI * t));
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

    const onCanPlay = () => tryPlay(a);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("timeupdate", onTime);
    b.addEventListener("timeupdate", onTime);
    a.addEventListener("error", () => onError(a));
    b.addEventListener("error", () => onError(b));
    tryPlay(a);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        tryPlay(front.current === "a" ? a : b);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("timeupdate", onTime);
      b.removeEventListener("timeupdate", onTime);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      <video
        ref={aRef}
        className="theme-video"
        autoPlay
        muted
        loop={false}
        playsInline
        preload="auto"
        aria-hidden
        style={{ opacity: 1 }}
      />
      <video
        ref={bRef}
        className="theme-video"
        muted
        playsInline
        preload="none"
        aria-hidden
        style={{ opacity: 0 }}
      />
      <div
        ref={veilRef}
        className="theme-video"
        aria-hidden
        style={{ background: "#07030c", opacity: 0, zIndex: 0, pointerEvents: "none" }}
      />
    </>
  );
}
