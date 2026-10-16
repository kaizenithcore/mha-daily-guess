import { HelpCircle } from "lucide-react";
import type { Character } from "@/lib/mhadle";
import type { GameMode } from "./GameModeSwitcher";

interface Props {
  target: Character | null;
  attemptCount: number;
  won: boolean;
  mode: GameMode;
  /** The case is closed (won or surrendered): show who it was. */
  revealed?: boolean;
}

const PROMPTS: Record<GameMode, string> = {
  classic: "Cada intento se compara campo a campo con la ficha del héroe.",
  silhouette: "La foto gana nitidez con cada intento.",
  quote: "¿Quién dijo esto?",
};

/** Taped instant photo slot, the notebook's "subject of today's analysis". */
function TapedPhoto({
  children,
  label,
  develop = false,
}: {
  children: React.ReactNode;
  label: string;
  develop?: boolean;
}) {
  return (
    <figure
      className={`relative shrink-0 rotate-[-2deg] ${develop ? "nb-develop" : ""} bg-white p-1.5 pb-5 shadow-[0_8px_16px_-10px_rgb(28_35_48/0.55)]`}
    >
      <span className="nb-tape -top-2.5 left-1/2 -translate-x-1/2 rotate-[3deg]" aria-hidden />
      <div className="relative size-24 overflow-hidden bg-[#d9e1ec] sm:size-28">{children}</div>
      <figcaption className="absolute inset-x-0 bottom-0.5 text-center font-hand text-xs text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
}

export function ModeShowcasePanel({ target, attemptCount, won, mode, revealed = false }: Props) {
  if (!target) return null;

  // Case closed: the subject's photo is filled in and the name circled.
  if (revealed) {
    return (
      <div className="flex items-center gap-5 px-4 pb-1 pt-6 sm:px-6">
        <TapedPhoto develop label={won ? "¡identificado!" : "identidad revelada"}>
          {target.image_url ? (
            <img
              src={target.image_url}
              alt={target.name}
              className="size-full object-cover object-top"
            />
          ) : (
            <HelpCircle className="m-auto size-10 text-ink-soft" aria-hidden />
          )}
        </TapedPhoto>
        <div className="nb-reveal min-w-0">
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            <span className={won ? "nb-circled" : ""}>{target.name}</span>
          </h2>
          {target.aliases?.[0] && (
            <p className="mt-1 font-hand text-lg text-pen">«{target.aliases[0]}»</p>
          )}
        </div>
      </div>
    );
  }

  if (mode === "quote") {
    return (
      <div className="px-4 pb-1 pt-5 sm:px-6">
        <p className="nb-printed mb-2">{PROMPTS.quote}</p>
        {target.quote ? (
          <blockquote className="font-hand text-2xl font-bold leading-snug text-pen sm:text-[1.7rem]">
            «{target.quote}»
          </blockquote>
        ) : (
          <p className="font-hand text-lg text-ink-soft">Sin cita registrada.</p>
        )}
      </div>
    );
  }

  if (mode === "silhouette") {
    const t = Math.min(attemptCount / 7, 1);
    const brightness = won ? 1 : 0.04 + t * 0.96;
    const blur = won ? 0 : Math.max(0, 14 - attemptCount * 1.9);
    const contrast = won ? 1 : 0.4 + t * 0.6;

    return (
      <div className="flex items-center gap-5 px-4 pb-1 pt-6 sm:px-6">
        <TapedPhoto label={won ? "¡identificado!" : `${Math.round(brightness * 100)}% visible`}>
          {target.image_url ? (
            <img
              src={target.image_url}
              alt="Silueta del héroe del día"
              className="size-full object-cover transition-[filter] duration-700"
              style={{
                filter: `brightness(${brightness}) contrast(${contrast}) blur(${blur}px) ${won ? "" : "grayscale(0.6)"}`,
              }}
            />
          ) : (
            <HelpCircle className="m-auto size-10 text-ink-soft" aria-hidden />
          )}
        </TapedPhoto>
        <div className="min-w-0">
          <h2 className="font-display text-3xl leading-none text-ink">¿Quién es?</h2>
          <p className="mt-2 font-hand text-base text-pen">{PROMPTS.silhouette}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5 px-4 pb-1 pt-6 sm:px-6">
      <TapedPhoto label="sujeto nº ?">
        <span
          className="absolute inset-0 flex items-center justify-center font-display text-5xl text-[#9fb0c6]"
          aria-hidden
        >
          ?
        </span>
      </TapedPhoto>
      <div className="min-w-0">
        <h2 className="font-display text-3xl leading-none text-ink">¿Quién es?</h2>
        <p className="mt-2 font-hand text-base text-pen">{PROMPTS.classic}</p>
      </div>
    </div>
  );
}
