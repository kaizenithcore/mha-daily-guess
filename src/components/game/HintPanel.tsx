import { Sparkles, Shield, Eye, ScanSearch } from "lucide-react";
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

export function HintPanel({
  target,
  attemptCount,
  won,
  mode,
}: Props) {
  if (!target) return null;

  const unlocked = {
    general: true,
    affiliation: attemptCount >= 1,
    quirk: attemptCount >= 2,
    physical: attemptCount >= 3,
    identity: attemptCount >= 4,
  };

  const intro =
    mode === "classic"
      ? "La ficha base va soltando datos a medida que avanzas."
      : mode === "silhouette"
        ? "La lectura visual ayuda a acotar al héroe."
        : "La voz deja pequeñas huellas del personaje.";

  return (
    <section className="panel-hero ua-frame mx-auto mb-5 max-w-xl animate-pop-in p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="chip">
          <Sparkles className="size-3" />
          Archivo U.A.
        </span>

        <span className="ua-meta">
          {won
            ? "Identidad confirmada"
            : `Acceso parcial · nivel ${Math.min(attemptCount + 1, 5)}`}
        </span>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{intro}</p>

      <div className="grid gap-2">

        {unlocked.general && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <Eye className="size-3" />
              Perfil general
            </div>

            <p className="mt-1 text-sm text-foreground">
              {mode === "silhouette"
                ? `La silueta refleja una presencia ${getPresence(target.height)} dentro del entorno de combate.`
                : `El registro de voz coincide con alguien habituado a situaciones de presión.`}
            </p>
          </div>
        )}

        {unlocked.affiliation && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <Shield className="size-3" />
              Registro académico
            </div>

            <p className="mt-1 text-sm text-foreground">
              {target.affiliation
                ? `Existen registros vinculados a ${target.affiliation}.`
                : "La afiliación oficial sigue clasificada."}
            </p>
          </div>
        )}

        {unlocked.quirk && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <ScanSearch className="size-3" />
              Análisis de don
            </div>

            <p className="mt-1 text-sm text-foreground">
              {getThreatTone(target.quirk_type)}.
            </p>
          </div>
        )}

        {unlocked.physical && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Datos parciales
            </div>

            <p className="mt-1 text-sm text-foreground">
              Primera actividad registrada en la temporada{" "}
              {target.first_appearance_season}. Edad estimada:{" "}
              {target.age ?? "desconocida"} años.
            </p>
          </div>
        )}

        {unlocked.identity && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3">
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-primary">
              Identidad asociada
            </div>

            <p className="mt-1 text-sm font-medium text-foreground">
              {target.aliases?.[0]
                ? `También responde al nombre de «${target.aliases[0]}».`
                : "No existen alias registrados."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}