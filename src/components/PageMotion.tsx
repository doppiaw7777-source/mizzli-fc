"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MatchMinuteBar() {
  return null;
}

export default function PageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [inner, setInner] = useState(children);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInner(children);
      setShow(true);
      return;
    }
    setShow(false);
    const hide = window.setTimeout(() => {
      setInner(children);
      setShow(true);
    }, 80);
    return () => window.clearTimeout(hide);
  }, [pathname]);

  return (
    <div
      className="page-fade"
      style={{
        opacity: show ? 1 : 0.01,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
    >
      {inner}
    </div>
  );
}
