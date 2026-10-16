import { ArrowDown, ArrowUp } from "lucide-react";
import type { AttemptComparison, Character, Comparison } from "@/lib/mhadle";
import { compareCharacters } from "@/lib/mhadle";

interface Attempt {
  guess: Character;
  cmp: AttemptComparison;
}

const COLS: Array<{ key: keyof AttemptComparison; label: string; unit?: string }> = [
  { key: "gender", label: "Género" },
  { key: "age", label: "Edad" },
  { key: "height", label: "Altura", unit: "cm" },
  { key: "quirk_type", label: "Don" },
  { key: "affiliation", label: "Afiliación" },
  { key: "nationality", label: "País" },
  { key: "first_appearance_season", label: "Temporada" },
];

const MARK: Record<Comparison, string> = {
  correct: "nb-mark nb-mark-correct",
  partial: "nb-mark nb-mark-partial",
  wrong: "nb-mark nb-mark-wrong",
};

const VERDICT: Record<Comparison, string> = {
  correct: "coincide",
  partial: "cerca",
  wrong: "no coincide",
};

export function AttemptsTable({
  attempts,
  target,
}: {
  attempts: Character[];
  target: Character | null;
}) {
  if (attempts.length === 0 || !target) return null;

  const rows: Attempt[] = [...attempts]
    .reverse()
    .map((g) => ({ guess: g, cmp: compareCharacters(g, target) }));

  return (
    <section aria-labelledby="analysis-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="analysis-heading" className="font-display text-2xl leading-none text-ink">
          Análisis
        </h2>
        <span className="nb-printed">
          {attempts.length} {attempts.length === 1 ? "intento" : "intentos"}
        </span>
      </div>
      <div className="nb-sheet @container">
        <ol>
          {rows.map((row, idx) => {
            const isLatest = idx === 0;
            return (
              <li key={`${row.guess.id}-${idx}`} className="nb-entry">
                <div className="mb-2.5 flex items-center gap-3">
                  <div className="size-11 shrink-0 overflow-hidden bg-[#d9e1ec] shadow-[0_2px_4px_rgb(28_35_48/0.18)]">
                    {row.guess.image_url && (
                      <img src={row.guess.image_url} alt="" className="size-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-hand text-xl font-bold leading-tight text-ink">
                      {row.guess.name}
                    </h3>
                    {row.guess.aliases?.[0] && (
                      <p className="truncate text-sm text-ink-soft">«{row.guess.aliases[0]}»</p>
                    )}
                  </div>
                  <span
                    className="font-hand text-lg font-bold text-ink-soft"
                    aria-label={`Intento ${rows.length - idx}`}
                  >
                    #{rows.length - idx}
                  </span>
                </div>

                <dl className="grid grid-cols-4 gap-x-3 gap-y-2.5 @[44rem]:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.8fr)_repeat(2,minmax(0,1fr))]">
                  {COLS.map(({ key, label, unit }, colIdx) => {
                    const cell = row.cmp[key] as AttemptComparison[keyof AttemptComparison];
                    const hint = "hint" in cell ? cell.hint : null;
                    const value =
                      cell.value == null
                        ? "¿?"
                        : unit
                          ? `${cell.value} ${unit}`
                          : String(cell.value);
                    return (
                      <div
                        key={key}
                        className={`nb-field ${key === "affiliation" ? "col-span-2 @[44rem]:col-span-1" : ""} ${isLatest ? "nb-write" : ""}`}
                        style={
                          isLatest
                            ? ({
                                ["--ink-delay" as string]: `${colIdx * 90}ms`,
                              } as React.CSSProperties)
                            : undefined
                        }
                      >
                        <dt>{label}</dt>
                        <dd className={hint ? "whitespace-nowrap" : undefined}>
                          <span className={MARK[cell.status]} title={VERDICT[cell.status]}>
                            {value}
                          </span>
                          {hint === "higher" && (
                            <span className="nb-arrow" title="El héroe del día tiene más">
                              <ArrowUp className="size-4" aria-label="más" strokeWidth={2.5} />
                            </span>
                          )}
                          {hint === "lower" && (
                            <span className="nb-arrow" title="El héroe del día tiene menos">
                              <ArrowDown className="size-4" aria-label="menos" strokeWidth={2.5} />
                            </span>
                          )}
                          <span className="sr-only"> ({VERDICT[cell.status]})</span>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            );
          })}
        </ol>

        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-sm text-ink-soft">
          <span>
            <span className="nb-mark nb-mark-correct text-ink">coincide</span>
          </span>
          <span>
            <span className="nb-mark nb-mark-partial text-ink">cerca</span>
          </span>
          <span>
            <span className="nb-mark nb-mark-wrong">no coincide</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowUp className="size-3.5 text-pen" aria-hidden /> el héroe tiene más
          </span>
        </p>
      </div>
    </section>
  );
}
