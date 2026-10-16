import { MAX_SEASON } from "@/lib/spoilers";

interface Props {
  season: number;
  onChange: (season: number) => void;
}

/** Printed notebook blank: "Visto hasta T__", filled in by the player. */
export function SpoilerSelect({ season, onChange }: Props) {
  return (
    <label className="nb-printed inline-flex items-baseline gap-1.5">
      Visto hasta
      <span className="relative inline-flex items-baseline">
        <select
          value={season}
          onChange={(e) => onChange(Number(e.target.value))}
          className="nb-fill nb-select cursor-pointer appearance-none bg-transparent pr-4"
          aria-label="Temporada del anime hasta la que has visto (limita los personajes para evitar spoilers)"
          title="Solo saldrán personajes que debutan hasta esa temporada"
        >
          {Array.from({ length: MAX_SEASON }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n === MAX_SEASON ? `T${n} (todo)` : `T${n}`}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          className="pointer-events-none absolute right-0.5 top-1/2 size-2.5 -translate-y-1/2 text-pen"
        >
          <path
            d="M1 1l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </label>
  );
}
