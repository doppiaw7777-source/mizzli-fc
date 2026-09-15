"use client";

import type { Player } from "@/lib/types";
import { photoFocus } from "@/lib/player-art";
import { splitPlayerName } from "@/lib/rosa-filters";

function ShieldFrame() {
  return (
    <svg viewBox="0 0 600 900" className="rosa-shield__svg" aria-hidden="true">
      <defs>
        <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8e7a4" />
          <stop offset="35%" stopColor="#d4af37" />
          <stop offset="70%" stopColor="#a67c12" />
          <stop offset="100%" stopColor="#f3d77a" />
        </linearGradient>
        <linearGradient id="gIvory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#e8d9b8" />
        </linearGradient>
        <radialGradient id="gSmoke" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#f3e6c8" />
          <stop offset="100%" stopColor="#c9b07a" />
        </radialGradient>
        <linearGradient id="gPurple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#5b1d8a" />
        </linearGradient>
        <clipPath id="innerWin">
          <path d="M300 78 L498 148 L532 290 L510 530 L300 590 L90 530 L68 290 Z" />
        </clipPath>
      </defs>
      <path
        d="M300 18 L470 70 L560 150 L575 310 L545 560 L300 870 L55 560 L25 310 L40 150 L130 70 Z"
        fill="url(#gGold)"
        stroke="#7a5b12"
        strokeWidth="3"
      />
      <path
        d="M300 42 L450 88 L530 160 L542 305 L516 545 L300 830 L84 545 L58 305 L70 160 L150 88 Z"
        fill="#1a0b18"
        opacity="0.18"
      />
      <path
        d="M300 70 L492 142 L528 288 L506 528 L300 586 L94 528 L72 288 Z"
        fill="url(#gSmoke)"
      />
      <path d="M72 250 L118 236 L132 430 L88 448 Z" fill="url(#gIvory)" />
      <path d="M528 250 L482 236 L468 430 L512 448 Z" fill="url(#gIvory)" />
      <path d="M86 268 L114 258 L122 318 L92 328 Z" fill="url(#gPurple)" />
      <path d="M514 268 L486 258 L478 318 L508 328 Z" fill="url(#gPurple)" />
      <path d="M90 360 L118 348 L126 410 L96 422 Z" fill="url(#gPurple)" />
      <path d="M510 360 L482 348 L474 410 L504 422 Z" fill="url(#gPurple)" />
      <path
        d="M78 560 L300 840 L522 560 L430 610 L300 590 L170 610 Z"
        fill="url(#gIvory)"
        stroke="url(#gGold)"
        strokeWidth="8"
      />
      <text
        x="300"
        y="690"
        textAnchor="middle"
        fontFamily="Times New Roman, serif"
        fontSize="46"
        fontWeight="700"
        fill="#8a6a16"
        letterSpacing="4"
      >
        MIZZLI FC
      </text>
      <text
        x="300"
        y="732"
        textAnchor="middle"
        fontFamily="Times New Roman, serif"
        fontSize="20"
        fill="#8a6a16"
        letterSpacing="6"
      >
        2026/27
      </text>
      <path d="M300 768 L318 798 L300 828 L282 798 Z" fill="url(#gPurple)" stroke="url(#gGold)" strokeWidth="3" />
    </svg>
  );
}

export default function RosaShieldCard({
  player,
  frameUrl,
}: {
  player: Player;
  frameUrl?: string;
}) {
  const photo = (player.photoUrl || "").trim();
  const { x, y, zoom } = photoFocus(player);
  const { first, last } = splitPlayerName(player.name);
  const custom = (frameUrl || "").trim();

  return (
    <article className="rosa-card">
      <div className="rosa-shield">
        {custom ? (
          <img
            src={custom}
            alt=""
            className="rosa-shield__frame"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <ShieldFrame />
        )}
        {photo ? (
          <div className="rosa-shield__photo">
            <img
              src={photo}
              alt={`Foto di ${player.name}`}
              className="rosa-shield__face"
              style={{
                objectPosition: `${x}% ${y}%`,
                transform: `translate(-50%, -38%) scale(${zoom / 100})`,
              }}
            />
          </div>
        ) : null}
        {custom ? (
          <img
            src={custom}
            alt=""
            className="rosa-shield__frame rosa-shield__frame--front"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="rosa-shield__svg-front">
            <ShieldFrame />
          </div>
        )}
      </div>
      <div className="rosa-card__meta">
        <p className="rosa-card__num">{player.number}</p>
        <h3 className="rosa-card__name">
          <span>{first}</span>
          {last ? <strong>{last}</strong> : null}
        </h3>
        <p className="rosa-card__role">{player.position || player.role}</p>
      </div>
    </article>
  );
}
