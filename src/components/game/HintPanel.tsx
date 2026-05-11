import { Eye, Quote, Lock } from "lucide-react";
import type { Character } from "@/lib/mhadle";
import type { GameMode } from "./GameModeSwitcher";

interface Props {
  target: Character | null;
  attemptCount: number;
  won: boolean;
  mode: GameMode;
}

/**
 * Mode-specific hint panel. Renders only the active mode's hint.
 * - classic → no panel
 * - silhouette → progressive reveal of portrait
 * - quote → reveals quote (locked first 2 attempts)
 */
export function HintPanel({ target, attemptCount, won, mode }: Props) {
  if (!target || mode === "classic") return null;

  if (mode === "silhouette") {
    const t = Math.min(attemptCount / 7, 1);
    const brightness = won ? 1 : 0.04 + t * 0.96;
    const blur = won ? 0 : Math.max(0, 14 - attemptCount * 1.9);
    const contrast = won ? 1 : 0.4 + t * 0.6;
    const img = target.silhouette_image_url || target.image_url;

    return (
      <section className="panel-hero ua-frame p-4 mb-5 animate-pop-in">
        <div className="flex items-center justify-between mb-3">
          <span className="chip">
            <Eye className="size-3" /> Modo silueta
          </span>
          <span className="ua-meta">
            {won ? "Revelado" : `${Math.round(brightness * 100)}% visible`}
          </span>
        </div>

        <div className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-primary/40 bg-secondary flex items-center justify-center silhouette-frame">
          {img ? (
            <img
              src={img}
              alt="Silueta del héroe"
              className="size-full object-cover transition-[filter] duration-700"
              style={{
                filter: `brightness(${brightness}) contrast(${contrast}) blur(${blur}px) ${won ? "" : "grayscale(0.6)"}`,
              }}
            />
          ) : (
            <span className="font-display text-6xl text-primary/30">?</span>
          )}
          {!won && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(135deg, color-mix(in oklab, var(--background) ${
                  68 - t * 50
                }%, transparent), transparent)`,
              }}
            />
          )}
          <div className="ua-corner ua-corner-tl" />
          <div className="ua-corner ua-corner-tr" />
          <div className="ua-corner ua-corner-bl" />
          <div className="ua-corner ua-corner-br" />
        </div>

        <p className="text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground mt-3">
          Cada intento revela más del héroe
        </p>
      </section>
    );
  }

  // quote mode
  const unlocked = won || attemptCount >= 2;
  return (
    <section className="panel-hero ua-frame p-4 mb-5 animate-pop-in">
      <div className="flex items-center justify-between mb-3">
        <span className="chip">
          <Quote className="size-3" /> Modo cita
        </span>
        <span className="ua-meta">
          {unlocked ? "Audio HUD" : `Bloqueado · ${2 - attemptCount} intento${2 - attemptCount === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="relative rounded-xl border-2 border-primary/30 bg-secondary/60 p-5 min-h-[7rem] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0 3px, color-mix(in oklab, var(--hero) 60%, transparent) 3px 4px)",
          }}
        />
        {unlocked && target.quote ? (
          <blockquote className="font-display text-xl sm:text-2xl leading-snug text-foreground relative z-10">
            <span className="text-primary text-3xl leading-none mr-1">«</span>
            {target.quote}
            <span className="text-primary text-3xl leading-none ml-1">»</span>
          </blockquote>
        ) : !target.quote ? (
          <p className="text-sm text-muted-foreground italic">Sin cita registrada</p>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Lock className="size-6" />
            <span className="text-xs uppercase tracking-[0.2em]">Transmisión cifrada</span>
          </div>
        )}
      </div>
    </section>
  );
}
