import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextUTCMidnight } from "@/lib/mhadle";

export function Countdown({ onReset }: { onReset?: () => void }) {
  const [ms, setMs] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMs(msUntilNextUTCMidnight());
    const id = setInterval(() => {
      const next = msUntilNextUTCMidnight();
      setMs(next);
      if (next <= 1000) onReset?.();
    }, 1000);
    return () => clearInterval(id);
  }, [onReset]);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="nb-printed">Próximo héroe en</span>
      <span className="font-hand text-lg font-bold tabular-nums text-pen">
        {mounted ? formatCountdown(ms) : "--:--:--"}
      </span>
    </span>
  );
}
