import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextUTCMidnight } from "@/lib/mhadle";

export function Countdown({ onReset }: { onReset?: () => void }) {
  const [ms, setMs] = useState(() => msUntilNextUTCMidnight());

  useEffect(() => {
    const id = setInterval(() => {
      const next = msUntilNextUTCMidnight();
      setMs(next);
      if (next <= 1000) onReset?.();
    }, 1000);
    return () => clearInterval(id);
  }, [onReset]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        Próximo héroe en
      </span>
      <span className="font-display text-2xl text-primary tabular-nums">
        {formatCountdown(ms)}
      </span>
    </div>
  );
}
