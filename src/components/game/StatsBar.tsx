import type { LocalStats } from "@/lib/mhadle";

/** Margin note: the player's record, jotted in pen beside the page. */
export function StatsBar({ stats }: { stats: LocalStats }) {
  const avg = stats.wins > 0 ? (stats.totalAttempts / stats.wins).toFixed(1) : "–";
  return (
    <p className="font-hand text-base leading-none text-pen">
      <span className="sr-only">Tus estadísticas: </span>
      racha <strong className="text-lg">{stats.streak}</strong>
      <span className="mx-1.5 text-ink-soft" aria-hidden>
        ·
      </span>
      mejor <strong className="text-lg">{stats.bestStreak}</strong>
      <span className="mx-1.5 text-ink-soft" aria-hidden>
        ·
      </span>
      media <strong className="text-lg">{avg}</strong>
      <span className="sr-only"> intentos</span>
    </p>
  );
}
