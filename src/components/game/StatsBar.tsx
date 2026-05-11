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
    <div className="grid grid-cols-3 gap-2.5">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="panel-info flex flex-col items-center px-2 py-3">
          <Icon className="mb-1 size-3.5 text-muted-foreground" />
          <span className="font-display text-2xl leading-none text-foreground">{value}</span>
          <span className="mt-0.5 text-[0.55rem] uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
