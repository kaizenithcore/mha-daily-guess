import { Lock } from "lucide-react";
import type { Character } from "@/lib/mhadle";
import type { GameMode } from "./GameModeSwitcher";

interface Props {
  target: Character | null;
  attemptCount: number;
  won: boolean;
  mode: GameMode;
}

function getPresence(height?: number | null) {
  if (!height) return "difícil de clasificar";

  if (height >= 185) return "imponente";
  if (height <= 160) return "ágil";
  return "equilibrada";
}

function getThreatTone(quirk?: string | null) {
  switch (quirk) {
    case "Mutante":
      return "presenta rasgos físicos permanentes";
    case "Transformación":
      return "muestra alteraciones corporales temporales";
    case "Emisor":
      return "canaliza energía o efectos externos";
    default:
      return "mantiene un patrón poco definido";
  }
}

export function HintPanel({ target, attemptCount, won, mode }: Props) {
  if (!target) return null;

  const hints: Array<{ title: string; unlockAt: number; body: string }> = [
    {
      title: "Perfil general",
      unlockAt: 0,
      body:
        mode === "silhouette"
          ? `La silueta refleja una presencia ${getPresence(target.height)} dentro del entorno de combate.`
          : "El registro de voz coincide con alguien habituado a situaciones de presión.",
    },
    {
      title: "Registro académico",
      unlockAt: 1,
      body: target.affiliation
        ? `Existen registros vinculados a ${target.affiliation}.`
        : "La afiliación oficial sigue clasificada.",
    },
    { title: "Análisis de don", unlockAt: 2, body: `Su don ${getThreatTone(target.quirk_type)}.` },
    {
      title: "Datos parciales",
      unlockAt: 3,
      body: `Primera actividad registrada en la temporada ${target.first_appearance_season ?? "¿?"}. Edad estimada: ${target.age ?? "desconocida"}${target.age ? " años" : ""}.`,
    },
    {
      title: "Identidad asociada",
      unlockAt: 4,
      body: target.aliases?.[0]
        ? `También responde al nombre de «${target.aliases[0]}».`
        : "No existen alias registrados.",
    },
  ];

  return (
    <section aria-label="Pistas">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl leading-none text-ink">Pistas</h2>
        <span className="nb-printed">
          {won ? "Identidad confirmada" : `${Math.min(attemptCount + 1, 5)} de 5 desbloqueadas`}
        </span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {hints.map((hint, i) => {
          const open = won || attemptCount >= hint.unlockAt;
          const remaining = hint.unlockAt - attemptCount;
          return (
            <li
              key={`${hint.title}-${open}`}
              className={`nb-postit ${open ? "nb-postit-stick" : "nb-postit-locked"}`}
              style={
                open
                  ? ({
                      ["--r" as string]: `${i % 2 === 0 ? -0.8 : 0.9}deg`,
                      ["--i" as string]: i,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <h3 className="nb-printed mb-1 flex items-center gap-1.5">
                {!open && <Lock className="size-3" aria-hidden />}
                {hint.title}
              </h3>
              {open ? (
                <p className="font-hand text-[1.05rem] leading-snug text-ink">{hint.body}</p>
              ) : (
                <p className="font-hand text-base text-ink-soft">
                  Se desbloquea en {remaining} {remaining === 1 ? "intento" : "intentos"}.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
