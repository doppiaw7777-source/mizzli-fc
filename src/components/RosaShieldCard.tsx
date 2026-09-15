"use client";

import type { Player } from "@/lib/types";
import { photoFocus } from "@/lib/player-art";
import { splitPlayerName } from "@/lib/rosa-filters";

export const PLAYER_CARD_FRAME = "/brand/player-card-frame.png";

const PHOTO_CLIP =
  "polygon(18% 16%, 50% 8%, 82% 16%, 89% 30%, 87% 58%, 70% 66%, 30% 66%, 13% 58%, 11% 30%)";

export default function RosaShieldCard({ player }: { player: Player }) {
  const photo = (player.photoUrl || "").trim();
  const { x, y, zoom } = photoFocus(player);
  const { first, last } = splitPlayerName(player.name);
  const alt = photo ? `Foto di ${player.name}` : "";

  return (
    <article className="rosa-card">
      <div className="rosa-shield">
        <img
          src={PLAYER_CARD_FRAME}
          alt=""
          className="rosa-shield__frame"
          width={600}
          height={900}
          draggable={false}
        />
        {photo ? (
          <div className="rosa-shield__photo" aria-hidden={!alt}>
            <img
              src={photo}
              alt={alt}
              className="rosa-shield__face"
              style={{
                objectPosition: `${x}% ${y}%`,
                transform: `translate(-50%, -38%) scale(${zoom / 100})`,
              }}
            />
          </div>
        ) : null}
        <img
          src={PLAYER_CARD_FRAME}
          alt="Card MIZZLI FC 2026/27"
          className="rosa-shield__frame rosa-shield__frame--front"
          width={600}
          height={900}
          draggable={false}
        />
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
