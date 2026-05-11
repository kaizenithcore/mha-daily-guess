import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Countdown } from "@/components/game/Countdown";
import { CharacterSearch } from "@/components/game/CharacterSearch";
import { AttemptsTable } from "@/components/game/AttemptsTable";
import { StatsBar } from "@/components/game/StatsBar";
import { ShareButton } from "@/components/game/ShareButton";
import { HintPanel } from "@/components/game/HintPanel";
import {
  loadStats,
  loadTodayState,
  recordWin,
  saveTodayState,
  todayKeyUTC,
  type Character,
  type LocalStats,
} from "@/lib/mhadle";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [attempts, setAttempts] = useState<Character[]>([]);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [stats, setStats] = useState<LocalStats>(() => loadStats());

  const charactersQ = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Character[];
    },
  });

  const dailyQ = useQuery({
    queryKey: ["daily", todayKeyUTC()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_characters")
        .select("character_id, date")
        .eq("date", todayKeyUTC())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const target = useMemo<Character | null>(() => {
    if (!dailyQ.data || !charactersQ.data) return null;
    return charactersQ.data.find((c) => c.id === dailyQ.data!.character_id) ?? null;
  }, [dailyQ.data, charactersQ.data]);

  // Restore today's progress
  useEffect(() => {
    if (!charactersQ.data) return;
    const t = loadTodayState();
    if (t.attemptIds.length === 0) return;
    const map = new Map(charactersQ.data.map((c) => [c.id, c]));
    const restored = t.attemptIds.map((id) => map.get(id)).filter(Boolean) as Character[];
    setAttempts(restored);
    setWon(t.won);
  }, [charactersQ.data]);

  const excludeIds = useMemo(() => new Set(attempts.map((a) => a.id)), [attempts]);

  const handleGuess = (c: Character) => {
    if (won || !target) return;
    const next = [...attempts, c];
    setAttempts(next);
    const isWin = c.id === target.id;
    saveTodayState({ date: todayKeyUTC(), attemptIds: next.map((a) => a.id), won: isWin });
    if (isWin) {
      setWon(true);
      setStats(recordWin(next.length));
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-6 pb-24 sm:pt-10">
      {/* Header */}
      <header className="text-center mb-6">
        <span className="chip mb-3">
          <Sparkles className="size-3" /> Daily hero
        </span>
        <h1 className="font-display text-5xl sm:text-6xl tracking-wider">
          <span className="text-primary drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">MHA</span>
          <span className="text-foreground">dle</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Adivina el héroe del día. Plus Ultra.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 mb-5">
        <div className="panel-hero p-3 flex items-center justify-between gap-4">
          <Countdown onReset={() => location.reload()} />
          <div className="text-right">
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              Reto #{daysSinceLaunch()}
            </div>
            <div className="font-display text-lg text-primary">U.A. High</div>
          </div>
        </div>
        <StatsBar stats={stats} />
      </section>

      <HintPanel target={target} attemptCount={attempts.length} won={won} />

      {/* Search */}
      <section className={`mb-5 ${shake ? "animate-shake" : ""}`}>
        {charactersQ.isLoading ? (
          <div className="panel-hero p-4 text-sm text-muted-foreground text-center">
            Cargando héroes...
          </div>
        ) : (
          <CharacterSearch
            characters={charactersQ.data ?? []}
            excludeIds={excludeIds}
            disabled={won}
            onPick={handleGuess}
          />
        )}
      </section>

      {/* Win banner */}
      {won && target && (
        <section className="panel-hero glow-hero p-5 text-center mb-5 animate-pop-in">
          <div
            className="chip mx-auto mb-3"
            style={{
              background: "color-mix(in oklab, var(--correct) 25%, transparent)",
              color: "var(--correct)",
              borderColor: "color-mix(in oklab, var(--correct) 50%, transparent)",
            }}
          >
            ¡Plus Ultra!
          </div>
          {target.image_url && (
            <div className="mx-auto mb-3 size-28 rounded-full overflow-hidden border-4 border-primary shadow-[0_0_30px_color-mix(in_oklab,var(--hero)_55%,transparent)]">
              <img src={target.image_url} alt={target.name} className="size-full object-cover" />
            </div>
          )}
          <h2 className="font-display text-3xl text-primary">{target.name}</h2>
          {target.aliases?.[0] && (
            <p className="text-sm text-muted-foreground mt-1">«{target.aliases[0]}»</p>
          )}
          <p className="text-sm mt-3 mb-4">
            Resuelto en <strong>{attempts.length}</strong>{" "}
            {attempts.length === 1 ? "intento" : "intentos"} · Racha{" "}
            <strong>{stats.streak}</strong> 🔥
          </p>
          <ShareButton
            puzzleNumber={daysSinceLaunch()}
            attempts={attempts}
            target={target}
          />
        </section>
      )}

      {/* Attempts */}
      <AttemptsTable attempts={attempts} target={target} />

      {attempts.length === 0 && !charactersQ.isLoading && (
        <div className="panel-hero p-6 text-center text-sm text-muted-foreground">
          Empieza escribiendo el nombre de un héroe o villano...
        </div>
      )}

      <footer className="mt-10 text-center text-[0.7rem] text-muted-foreground">
        Hecho por fans · No oficial · Reset diario 00:00 UTC
      </footer>
    </main>
  );
}

function daysSinceLaunch() {
  const launch = Date.UTC(2026, 4, 1); // arbitrary launch date
  const today = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  );
  return Math.max(1, Math.floor((today - launch) / 86400000) + 1);
}
