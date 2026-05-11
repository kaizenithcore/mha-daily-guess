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
    ? attempts.map((g) => ({ guess: g, cmp: compareCharacters(g, target) }))
    : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Intentos · {attempts.length}
        </span>
      </div>

      {rows.map((row, idx) => (
        <div
          key={`${row.guess.id}-${idx}`}
          className="panel-hero p-3 animate-pop-in"
        >
          <div className="flex items-center gap-3 mb-2.5">
            <div className="size-10 rounded-md border-2 border-primary/40 bg-secondary overflow-hidden shrink-0 flex items-center justify-center font-display text-primary">
              {row.guess.image_url ? (
                <img src={row.guess.image_url} alt="" className="size-full object-cover" />
              ) : (
                row.guess.name[0]
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg leading-tight truncate">{row.guess.name}</div>
              {row.guess.aliases?.[0] && (
                <div className="text-xs text-muted-foreground truncate">{row.guess.aliases[0]}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {COLS.map(({ key, label }) => {
              const cell = row.cmp[key] as AttemptComparison[keyof AttemptComparison];
              const value = cell.value ?? "—";
              const hint = "hint" in cell ? cell.hint : null;
              return (
                <div key={key} className={tileClass(cell.status)}>
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
      ))}
    </div>
  );
}
