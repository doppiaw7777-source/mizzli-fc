"use client";

import type { CSSProperties } from "react";
import type { Player } from "@/lib/types";
import { useTeam } from "@/context/TeamContext";
import { MIZZLI_CREST } from "@/lib/brand";
import { playerThumb } from "@/lib/player-art";
import { shortPlayerLabel } from "@/lib/player-name";
import {
  DEFAULT_PLAYER_GRAPHIC,
  getPlayerGraphic,
  type PlayerGraphicId,
} from "@/lib/player-graphics";

const PX = { xs: 36, sm: 48, md: 64, lg: 88, xl: 112 } as const;
const ROLE_LETTER: Record<string, string> = {
  POR: "P",
  DIF: "D",
  CEN: "C",
  ATT: "A",
};

export function PlayerKit({
  player,
  size = "md",
  captain = false,
  className = "",
  animate = true,
  photoHead = false,
  graphicId,
}: {
  player: Player;
  size?: keyof typeof PX;
  captain?: boolean;
  className?: string;
  animate?: boolean;
  photoHead?: boolean;
  graphicId?: string;
}) {
  const { data } = useTeam();
  const graphic = getPlayerGraphic(
    graphicId || data?.settings.ui.playerGraphicId || DEFAULT_PLAYER_GRAPHIC
  );
  const px = PX[size];
  const gk = player.role === "POR";
  const delay = animate ? Math.min((player.number % 11) * 35, 240) : 0;
  const showPhoto = graphic.photo || photoHead;
  const photo = showPhoto ? player.photoUrl || playerThumb(player) : "";

  return (
    <div
      className={`player-mark pg-${graphic.id} ${gk ? "pg-gk" : ""} ${
        animate ? "" : "player-kit-static"
      } ${className}`}
      style={
        {
          width: px,
          height: px,
          animationDelay: `${delay}ms`,
          "--pg-size": `${px}px`,
        } as CSSProperties
      }
      data-role={player.role}
      aria-hidden
    >
      <div className="player-mark-frame">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="player-mark-media"
            onError={(e) => {
              const fallback = playerThumb(player);
              const el = e.currentTarget;
              if (el.getAttribute("data-fallback") === "1") {
                el.style.display = "none";
                return;
              }
              el.setAttribute("data-fallback", "1");
              el.src = fallback;
            }}
          />
        ) : (
          <span className="player-mark-fill" />
        )}
        {graphic.id === "crest" && (
          <img src={MIZZLI_CREST} alt="" className="player-mark-crest" />
        )}
        <span className="player-mark-num">{player.number}</span>
        {graphic.id === "stack" && (
          <span className="player-mark-role">{ROLE_LETTER[player.role] || player.role}</span>
        )}
      </div>
      {captain && <span className="player-kit-c">C</span>}
    </div>
  );
}

export function PlayerToken({
  player,
  captain,
  selected,
  size = "sm",
  photoHead = false,
  graphicId,
  siblings,
}: {
  player: Player;
  captain?: boolean;
  selected?: boolean;
  size?: keyof typeof PX;
  photoHead?: boolean;
  graphicId?: string;
  siblings?: Player[];
}) {
  return (
    <div
      className={`player-token flex flex-col items-center ${selected ? "is-on scale-110" : ""}`}
    >
      <PlayerKit
        player={player}
        size={size}
        captain={captain}
        photoHead={photoHead}
        graphicId={graphicId}
      />
      <span className="player-token-name mt-0.5 max-w-[88px] truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
        {shortPlayerLabel(player, siblings)}
      </span>
    </div>
  );
}

export function PlayerCardArt({
  player,
  captain = false,
  className = "",
  delay = 0,
  graphicId,
}: {
  player: Player;
  captain?: boolean;
  className?: string;
  delay?: number;
  graphicId?: string;
}) {
  const { data } = useTeam();
  const graphic = getPlayerGraphic(
    graphicId || data?.settings.ui.playerGraphicId || DEFAULT_PLAYER_GRAPHIC
  );
  const art = player.photoUrl || playerThumb(player);
  return (
    <div
      className={`player-card-art ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <img src={art} alt="" className="player-card-art-img" />
      <div className="player-card-art-fade" />
      <div className="player-card-art-kit">
        <PlayerKit
          player={player}
          size="xs"
          captain={false}
          animate={false}
          graphicId={graphic.id}
        />
      </div>
      {captain && <span className="player-kit-c">C</span>}
      <div className="player-card-art-foot">
        <p className="player-card-art-name">{player.name}</p>
        <p className="player-card-art-role">{player.position}</p>
      </div>
    </div>
  );
}

export type { PlayerGraphicId };
