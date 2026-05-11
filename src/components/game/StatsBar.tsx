import { Flame, Trophy, Target } from "lucide-react";
import type { LocalStats } from "@/lib/mhadle";

export function StatsBar({ stats }: { stats: LocalStats }) {
  const avg = stats.wins > 0 ? (stats.totalAttempts / stats.wins).toFixed(1) : "—";
  const items = [
    { icon: Flame, label: "Racha", value: stats.streak },
    { icon: Trophy, label: "Mejor", value: stats.bestStreak },
    { icon: Target, label: "Media", value: avg },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="panel-hero py-2 px-2 flex flex-col items-center">
          <Icon className="size-4 text-primary mb-0.5" />
          <span className="font-display text-xl leading-none">{value}</span>
          <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground mt-0.5">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
