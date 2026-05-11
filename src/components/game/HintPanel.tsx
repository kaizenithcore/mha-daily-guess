import { useState } from "react";
import { Eye, Quote } from "lucide-react";
import type { Character } from "@/lib/mhadle";

interface Props {
  target: Character | null;
  attemptCount: number;
  won: boolean;
}

/**
 * Silhouette + quote hint panel.
 * - Silhouette starts fully dark and progressively brightens with each attempt.
 * - Quote unlocks automatically after 4 attempts, or via "Mostrar cita".
 */
export function HintPanel({ target, attemptCount, won }: Props) {
  const [forceQuote, setForceQuote] = useState(false);
  if (!target) return null;

  // Brightness curve: 0 → 1 across ~7 attempts. Blur fades out too.
  const t = Math.min(attemptCount / 7, 1);
  const brightness = won ? 1 : 0.05 + t * 0.95;
  const blur = won ? 0 : Math.max(0, 12 - attemptCount * 1.8);
  const contrast = won ? 1 : 0.4 + t * 0.6;

  const quoteUnlocked = won || forceQuote || attemptCount >= 4;
  const img = target.silhouette_image_url || target.image_url;

  return (
    <section className="panel-hero p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="chip">
          <Eye className="size-3" /> Pista visual
        </span>
        <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          {won ? "Revelado" : `${Math.round(brightness * 100)}% visible`}
        </span>
      </div>

      <div className="relative mx-auto w-40 h-40 rounded-xl overflow-hidden border-2 border-primary/30 bg-secondary flex items-center justify-center">
        {img ? (
          <img
            src={img}
            alt="Silueta del héroe"
            className="size-full object-cover transition-[filter] duration-500"
            style={{
              filter: `brightness(${brightness}) contrast(${contrast}) blur(${blur}px)`,
            }}
          />
        ) : (
          <span className="font-display text-5xl text-primary/30">?</span>
        )}
        {!won && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklab, var(--background) ${
                70 - t * 50
              }%, transparent), transparent)`,
            }}
          />
        )}
      </div>

      <div className="mt-4">
        {quoteUnlocked && target.quote ? (
          <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-foreground/90 animate-pop-in">
            <Quote className="size-3 inline mr-1 text-primary" />
            «{target.quote}»
          </blockquote>
        ) : target.quote ? (
          <button
            type="button"
            onClick={() => setForceQuote(true)}
            className="w-full text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition py-2 border border-dashed border-border rounded-md"
          >
            <Quote className="size-3 inline mr-1" />
            Mostrar cita ({Math.max(0, 4 - attemptCount)} intentos restantes)
          </button>
        ) : null}
      </div>
    </section>
  );
}
