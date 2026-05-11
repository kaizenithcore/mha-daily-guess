import { Eye, Quote, Lock } from "lucide-react";
import type { Character } from "@/lib/mhadle";
import type { GameMode } from "./GameModeSwitcher";

interface Props {
  target: Character | null;
  attemptCount: number;
  won: boolean;
  mode: GameMode;
}

export function ModeShowcasePanel({ target, attemptCount, won, mode }: Props) {
  if (!target || mode === "classic") return null;

  if (mode === "silhouette") {
    const t = Math.min(attemptCount / 7, 1);
    const brightness = won ? 1 : 0.04 + t * 0.96;
    const blur = won ? 0 : Math.max(0, 14 - attemptCount * 1.9);
    const contrast = won ? 1 : 0.4 + t * 0.6;
    const img = target.silhouette_image_url || target.image_url;

    return (
      <section className="panel-hero ua-frame mx-auto mb-5 max-w-xl animate-pop-in p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="chip">
            <Eye className="size-3" /> Modo silueta
          </span>
          <span className="ua-meta">{won ? "Revelado" : `${Math.round(brightness * 100)}% visible`}</span>
        </div>

        <div className="silhouette-frame relative mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-secondary sm:h-52 sm:w-52">
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
                background: `linear-gradient(135deg, color-mix(in oklab, var(--background) ${68 - t * 50}%, transparent), transparent)`,
              }}
            />
          )}
          <div className="ua-corner ua-corner-tl" />
          <div className="ua-corner ua-corner-tr" />
          <div className="ua-corner ua-corner-bl" />
          <div className="ua-corner ua-corner-br" />
        </div>

        <p className="mt-3 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          La silueta gana detalle con cada intento
        </p>
      </section>
    );
  }

  const unlocked = won || attemptCount >= 2;
  return (
    <section className="panel-hero ua-frame mx-auto mb-5 max-w-xl animate-pop-in p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="chip">
          <Quote className="size-3" /> Modo cita
        </span>
        <span className="ua-meta">
          {unlocked ? "Disponible" : `Bloqueada · ${Math.max(0, 2 - attemptCount)} intento${Math.max(0, 2 - attemptCount) === 1 ? "" : "s"} restante${Math.max(0, 2 - attemptCount) === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="relative flex min-h-[7rem] items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-secondary/60 p-5 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-18"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0 3px, color-mix(in oklab, var(--hero) 60%, transparent) 3px 4px)",
          }}
        />
        {unlocked && target.quote ? (
          <blockquote className="font-display relative z-10 text-xl leading-snug text-foreground sm:text-2xl">
            <span className="mr-1 text-3xl leading-none text-primary">«</span>
            {target.quote}
            <span className="ml-1 text-3xl leading-none text-primary">»</span>
          </blockquote>
        ) : !target.quote ? (
          <p className="text-sm italic text-muted-foreground">Sin cita registrada</p>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Lock className="size-6" />
            <span className="text-xs uppercase tracking-[0.2em]">Pista cifrada</span>
          </div>
        )}
      </div>
    </section>
  );
}
