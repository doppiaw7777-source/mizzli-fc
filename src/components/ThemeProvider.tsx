"use client";

import type { GraphicStyle } from "@/lib/themes";
import type { TeamSettings } from "@/lib/types";
import { graphicCss, graphicSize, getTheme } from "@/lib/themes";
import { useEffect } from "react";

type PageKey = "home" | "rosa" | "calendario" | "formazione" | "admin" | "altro";

const THEME_VIDEO_LOCAL =
  "/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";
const THEME_VIDEO_REMOTE =
  "https://raw.githubusercontent.com/doppiaw7777-source/mizzli-fc/main/public/brand/_users_71ddbb17-0bd5-421b-a9ed-8ccf3e0d9822_generated_4e4683f0-4dd0-4c87-8c41-2ee1da3db17b_generated_video.mp4";

export function getPageBackground(
  settings: TeamSettings,
  page: PageKey
): string {
  const pageBg =
    page === "altro"
      ? ""
      : settings.backgrounds[page === "home" ? "home" : page];
  if (pageBg) return pageBg;
  if (settings.backgrounds.global) return settings.backgrounds.global;
  return "";
}

export function ThemeStyles({ settings }: { settings: TeamSettings }) {
  const theme = getTheme(settings.themeId);
  const graphic = (settings.graphicStyle || theme.graphicStyle) as GraphicStyle;
  const intensity = (settings.ui.graphicIntensity ?? 70) / 100;
  const radius =
    settings.ui.buttonStyle === "pill"
      ? 999
      : settings.ui.buttonStyle === "square"
        ? 6
        : settings.ui.cardRadius;
  const glow = settings.ui.cardGlow
    ? `0 0 0 1px ${settings.colors.accent}33, 0 12px 40px ${settings.colors.accent}22`
    : "none";

  return (
    <style jsx global>{`
      :root {
        --team-primary: ${settings.colors.primary};
        --team-secondary: ${settings.colors.secondary};
        --team-accent: ${settings.colors.accent};
        --team-text: ${settings.colors.text};
        --team-card-bg: ${settings.colors.cardBg};
        --team-radius: ${settings.ui.cardRadius}px;
        --team-overlay: ${settings.ui.backgroundOverlay ?? 55};
        --team-btn-radius: ${radius}px;
        --team-glow: ${glow};
        --team-graphic: ${graphicCss(graphic, settings.colors.accent)};
        --team-graphic-size: ${graphicSize(graphic)};
        --team-graphic-opacity: ${intensity};
        --team-gradient: ${settings.themeGradient || theme.gradient};
      }
      body {
        font-family: ${settings.fontFamily};
        color: var(--team-text);
      }
      .team-card {
        box-shadow: var(--team-glow);
      }
      button.rounded-xl,
      a.rounded-xl {
        border-radius: var(--team-btn-radius) !important;
      }
      .theme-video {
        position: fixed;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
    `}</style>
  );
}

export function PageBackground({
  settings,
  page,
  children,
  className = "",
}: {
  settings: TeamSettings;
  page: PageKey;
  children: React.ReactNode;
  className?: string;
}) {
  const overlay = Math.min(settings.ui.backgroundOverlay ?? 32, 40);
  const theme = getTheme(settings.themeId);
  const compact = settings.ui.compactMode;

  return (
    <div
      className={`relative min-h-dvh overflow-hidden bg-[#07030c] ${className}`}
      data-theme={settings.themeId}
      data-graphic={settings.graphicStyle || theme.graphicStyle}
    >
      <video
        className="theme-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={THEME_VIDEO_LOCAL} type="video/mp4" />
        <source src={THEME_VIDEO_REMOTE} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: `rgba(7,3,12,${overlay / 100})` }}
        aria-hidden
      />
      <PitchParallax />
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
        <div
          className="pitch-grain absolute inset-0"
          style={{
            backgroundImage: "var(--team-graphic)",
            backgroundSize: "var(--team-graphic-size)",
            opacity: "calc(var(--team-graphic-opacity) * 0.18)",
          }}
        />
      </div>
      <div className={`relative z-[2] ${compact ? "[&_.space-y-10]:space-y-6 [&_.p-6]:p-4" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function PitchParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.querySelector(".pitch-grain") as HTMLElement | null;
    if (!el) return;
    const onScroll = () => {
      el.style.backgroundPosition = `center ${Math.round(window.scrollY * 0.12)}px`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
