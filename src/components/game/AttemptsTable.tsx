import { ArrowDown, ArrowUp } from "lucide-react";
import type { AttemptComparison, Character, Comparison } from "@/lib/mhadle";
import { compareCharacters } from "@/lib/mhadle";

interface Attempt {
  guess: Character;
  cmp: AttemptComparison;
}

const COLS: Array<{ key: keyof AttemptComparison; label: string }> = [
  { key: "gender", label: "Género" },
  { key: "age", label: "Edad" },
  { key: "height", label: "Altura" },
  { key: "quirk_type", label: "Don" },
  { key: "affiliation", label: "Afiliación" },
  { key: "nationality", label: "País" },
  { key: "first_appearance_season", label: "Temp." },
];

const tileClass = (s: Comparison) =>
  s === "correct" ? "tile tile-correct" : s === "partial" ? "tile tile-partial" : "tile tile-wrong";

export function AttemptsTable({
  attempts,
  target,
}: {
  attempts: Character[];
  target: Character | null;
}) {
  if (attempts.length === 0) return null;

  const rows: Attempt[] = target
    ? [...attempts].reverse().map((g) => ({ guess: g, cmp: compareCharacters(g, target) }))
    : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Intentos · {attempts.length}
        </span>
      </div>

      {rows.map((row, idx) => {
        const isLatest = idx === 0;
        return (
          <div
            key={`${row.guess.id}-${idx}`}
            className="panel-hero ua-frame animate-card-in p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary font-display text-primary shadow-[0_0_0_1px_color-mix(in_oklab,var(--hero)_20%,transparent)]">
                {row.guess.image_url ? (
                  <img src={row.guess.image_url} alt="" className="size-full object-cover" />
                ) : (
                  row.guess.name[0]
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-xl leading-tight truncate">{row.guess.name}</div>
                {row.guess.aliases?.[0] && (
                  <div className="truncate text-xs text-muted-foreground">
                    «{row.guess.aliases[0]}»
                  </div>
                )}
              </div>
              <span className="ua-badge font-display">#{rows.length - idx}</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {COLS.map(({ key, label }, colIdx) => {
                const cell = row.cmp[key] as AttemptComparison[keyof AttemptComparison];
                const value = cell.value ?? "—";
                const hint = "hint" in cell ? cell.hint : null;
                const delay = isLatest ? colIdx * 110 : 0;
                return (
                  <div
                    key={key}
                    className={`${tileClass(cell.status)} ${isLatest ? "animate-tile-flip" : ""}`}
                    style={isLatest ? { animationDelay: `${delay}ms` } : undefined}
                  >
                    <span className="tile-label">{label}</span>
                    <span className="flex items-center gap-0.5">
                      {value}
                      {hint === "higher" && <ArrowUp className="size-3" />}
                      {hint === "lower" && <ArrowDown className="size-3" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
