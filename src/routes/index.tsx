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
import { ModeShowcasePanel } from "@/components/game/ModeShowcasePanel";
import { HintPanel } from "@/components/game/HintPanel";
import { ArchiveDateModal } from "@/components/game/ArchiveDateModal";
import { EndlessSummaryDialog } from "@/components/game/EndlessSummaryDialog";
import { GameModeSwitcher, type GameMode } from "@/components/game/GameModeSwitcher";
import { SupportFooter } from "@/components/game/SupportFooter";
import {
  loadInfiniteEnabled,
  loadStats,
  loadEndlessState,
  loadTodayState,
  recordWin,
  resetEndlessState,
  saveEndlessState,
  saveInfiniteEnabled,
  saveTodayState,
  shiftDateKey,
  todayKeyUTC,
  updateEndlessRecord,
  type EndlessState,
  type Character,
  type LocalStats,
} from "@/lib/mhadle";

export const Route = createFileRoute("/")({
  component: Index,
});

const LAUNCH_DATE_KEY = "2026-05-01";
const ARCHIVE_DATE_STORAGE_KEY = "mhadle:archive-date";
const MODE_LABELS: Record<GameMode, string> = {
  classic: "Clásico",
  silhouette: "Silueta",
  quote: "Cita",
};

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildModeTargets(characters: Character[], dayKey: string): Record<GameMode, Character | null> {
  const sorted = [...characters].sort((a, b) => {
    const left = hashString(`${dayKey}:${a.id}`);
    const right = hashString(`${dayKey}:${b.id}`);
    return left - right;
  });

  return {
    classic: sorted[0] ?? null,
    silhouette: sorted[1] ?? null,
    quote: sorted[2] ?? null,
  };
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function puzzleNumberForDate(dateKey: string): number {
  const launch = new Date(`${LAUNCH_DATE_KEY}T00:00:00.000Z`).getTime();
  const current = new Date(`${dateKey}T00:00:00.000Z`).getTime();
  return Math.max(1, Math.floor((current - launch) / 86400000) + 1);
}

function buildEndlessTarget(characters: Character[], mode: GameMode, dayKey: string, roundIndex: number): Character | null {
  const sorted = [...characters].sort((a, b) => {
    const left = hashString(`endless:${mode}:${dayKey}:${roundIndex}:${a.id}`);
    const right = hashString(`endless:${mode}:${dayKey}:${roundIndex}:${b.id}`);
    return left - right;
  });

  if (sorted.length === 0) return null;
  return sorted[roundIndex % sorted.length] ?? sorted[0] ?? null;
}

function Index() {
  const [attempts, setAttempts] = useState<Character[]>([]);
  const [won, setWon] = useState(false);
  const [surrendered, setSurrendered] = useState(false);
  const [shake, setShake] = useState(false);
  const [stats, setStats] = useState<LocalStats>(() => loadStats());
  const [mode, setMode] = useState<GameMode>("classic");
  const [infiniteEnabled, setInfiniteEnabled] = useState(false);
  const [archiveDateKey, setArchiveDateKey] = useState<string | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [hintsVisible, setHintsVisible] = useState(true);
  const [endlessState, setEndlessState] = useState<EndlessState>(() => loadEndlessState(mode, todayKeyUTC()));
  const [endlessSummary, setEndlessSummary] = useState<{
    roundsCompleted: number;
    previousRecord: number;
    bestRecord: number;
    isNewRecord: boolean;
  } | null>(null);
  const dailyDateKey = todayKeyUTC();
  const activeDateKey = archiveDateKey ?? dailyDateKey;

  useEffect(() => {
    saveInfiniteEnabled(infiniteEnabled);
  }, [infiniteEnabled]);

  useEffect(() => {
    setInfiniteEnabled(loadInfiniteEnabled());
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(ARCHIVE_DATE_STORAGE_KEY);
    setArchiveDateKey(stored && stored >= LAUNCH_DATE_KEY ? stored : null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (archiveDateKey) {
      localStorage.setItem(ARCHIVE_DATE_STORAGE_KEY, archiveDateKey);
    } else {
      localStorage.removeItem(ARCHIVE_DATE_STORAGE_KEY);
    }
  }, [archiveDateKey]);

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

  const target = useMemo<Character | null>(() => {
    if (!charactersQ.data) return null;
    if (infiniteEnabled) {
      return buildEndlessTarget(charactersQ.data, mode, activeDateKey, endlessState.roundIndex);
    }
    const targets = buildModeTargets(charactersQ.data, activeDateKey);
    return targets[mode];
  }, [charactersQ.data, activeDateKey, infiniteEnabled, mode, endlessState.roundIndex]);

  const currentDayLabel = useMemo(() => {
    if (archiveDateKey) return `Archivo · ${formatDateLabel(activeDateKey)}`;
    return "Día real";
  }, [activeDateKey, archiveDateKey]);

  // Restore progress for the active mode and day/run
  useEffect(() => {
    if (!charactersQ.data) return;
    const map = new Map(charactersQ.data.map((c) => [c.id, c]));

    if (infiniteEnabled) {
      const state = loadEndlessState(mode, activeDateKey);
      setEndlessState(state);
      const restored = state.attemptIds.map((id) => map.get(id)).filter(Boolean) as Character[];
      setAttempts(restored);
      setWon(state.phase === "revealed" && state.result === "won");
      setSurrendered(state.phase === "revealed" && state.result === "surrendered");
      setHintsVisible(false);
      return;
    }

    const t = loadTodayState(mode, activeDateKey);
    const restored = t.attemptIds.map((id) => map.get(id)).filter(Boolean) as Character[];
    setAttempts(restored);
    setWon(t.won);
    setSurrendered(t.surrendered);
    setEndlessSummary(null);
  }, [charactersQ.data, activeDateKey, mode, infiniteEnabled]);

  const excludeIds = useMemo(() => new Set(attempts.map((a) => a.id)), [attempts]);

  const currentRoundLabel = infiniteEnabled
    ? `Ronda ${endlessState.roundIndex + 1}`
    : `Intento ${attempts.length + 1}`;

  const hasEnded = infiniteEnabled
    ? endlessState.phase !== "playing"
    : won || surrendered;

  const infiniteModeLabel = MODE_LABELS[mode];

  const revealHero = (nextWon: boolean, nextSurrendered: boolean) => {
    setWon(nextWon);
    setSurrendered(nextSurrendered);
  };

  const persistDailyState = (nextAttempts: Character[], nextWon: boolean, nextSurrendered: boolean) => {
    saveTodayState(
      {
        date: activeDateKey,
        attemptIds: nextAttempts.map((a) => a.id),
        won: nextWon,
        surrendered: nextSurrendered,
      },
      mode,
      activeDateKey,
    );
  };

  const persistEndlessState = (nextState: EndlessState) => {
    setEndlessState(nextState);
    saveEndlessState(nextState, mode, activeDateKey);
  };

  const openEndlessSummary = (nextState: EndlessState) => {
    const record = updateEndlessRecord(mode, activeDateKey, nextState.roundsCompleted);
    setEndlessSummary({
      roundsCompleted: nextState.roundsCompleted,
      previousRecord: record.previousRecord,
      bestRecord: record.bestRecord,
      isNewRecord: record.isNewRecord,
    });
  };

  const handleGuess = (c: Character) => {
    if (!target || hasEnded) return;
    if (infiniteEnabled) {
      if (endlessState.phase !== "playing") return;

      const nextAttempts = [...attempts, c];
      const isWin = c.id === target.id;

      if (isWin) {
        const nextState: EndlessState = {
          ...endlessState,
          attemptIds: nextAttempts.map((a) => a.id),
          phase: "revealed",
          result: "won",
          roundsCompleted: endlessState.roundsCompleted + 1,
        };
        setAttempts(nextAttempts);
        revealHero(true, false);
        setEndlessSummary(null);
        persistEndlessState(nextState);
        return;
      }

      const livesLeft = endlessState.livesLeft - 1;
      if (livesLeft <= 0) {
        const nextState: EndlessState = {
          ...endlessState,
          attemptIds: nextAttempts.map((a) => a.id),
          livesLeft: 0,
          phase: "gameover",
          result: "lost",
        };
        setAttempts(nextAttempts);
        revealHero(false, false);
        setShake(true);
        setTimeout(() => setShake(false), 400);
        persistEndlessState(nextState);
        openEndlessSummary(nextState);
        return;
      }

      const nextState: EndlessState = {
        ...endlessState,
        attemptIds: nextAttempts.map((a) => a.id),
        livesLeft,
      };
      setAttempts(nextAttempts);
      persistEndlessState(nextState);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const next = [...attempts, c];
    setAttempts(next);
    const isWin = c.id === target.id;
    persistDailyState(next, isWin, false);
    if (isWin) {
      revealHero(true, false);
      setStats(recordWin(next.length, activeDateKey));
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleSurrender = () => {
    if (!target || hasEnded) return;
    if (infiniteEnabled) {
      const nextState: EndlessState = {
        ...endlessState,
        phase: "revealed",
        result: "surrendered",
        attemptIds: attempts.map((a) => a.id),
      };
      revealHero(false, true);
      persistEndlessState(nextState);
      openEndlessSummary(nextState);
      return;
    }

    persistDailyState(attempts, false, true);
    revealHero(false, true);
  };

  const handlePreviousDay = () => {
    const previousKey = shiftDateKey(activeDateKey, -1);
    if (previousKey < LAUNCH_DATE_KEY) return;
    setArchiveDateKey(previousKey);
    setArchiveModalOpen(false);
    setAttempts([]);
    setWon(false);
    setSurrendered(false);
  };

  const handleNextEndlessRound = () => {
    if (!infiniteEnabled || endlessState.phase !== "revealed" || endlessState.result !== "won") return;
    const nextState: EndlessState = {
      roundIndex: endlessState.roundIndex + 1,
      attemptIds: [],
      livesLeft: 3,
      roundsCompleted: endlessState.roundsCompleted,
      phase: "playing",
      result: null,
    };
    setAttempts([]);
    revealHero(false, false);
    setEndlessSummary(null);
    persistEndlessState(nextState);
  };

  const handleResetEndless = () => {
    if (!infiniteEnabled) return;
    const nextState = resetEndlessState(mode, activeDateKey);
    setAttempts([]);
    revealHero(false, false);
    setEndlessSummary(null);
    persistEndlessState(nextState);
  };

  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-2xl px-4 pb-24 pt-5 sm:px-6 sm:pt-8">
      <header className="relative isolate mb-6 text-center">
        <div aria-hidden className="absolute inset-0 -z-10 flex items-center justify-center">
          <div
            className="size-64 rounded-full opacity-30"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, color-mix(in oklab, var(--hero) 35%, transparent) 0deg 6deg, transparent 6deg 14deg)",
              maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
            }}
          />
        </div>
        <span className="chip chip-red mb-3">
          <Sparkles className="size-3" /> Daily hero
        </span>
        <h1 className="hero-title font-display text-6xl leading-none sm:text-7xl">
          <span className="text-primary drop-shadow-[3px_3px_0_rgba(0,0,0,0.45)]">MHA</span>
          <span className="text-foreground drop-shadow-[3px_3px_0_rgba(0,0,0,0.45)]">dle</span>
        </h1>
        <p className="hero-subtitle mt-2 text-xs sm:text-sm">
          Descubre al héroe del día.
        </p>
      </header>

      <section className="mb-5 grid gap-3">
        <div className="panel-info flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
          <div className="flex items-end gap-3">
            <Countdown onReset={() => location.reload()} />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="section-label justify-end">{currentDayLabel}</div>
              <div className="font-display text-2xl leading-none text-primary">{archiveDateKey
                  ? `#${puzzleNumberForDate(activeDateKey)}`
                  : "Reloj real"}</div>
            </div>
          </div>
        </div>
        <StatsBar stats={stats} />
      </section>

      <div className="mb-4 flex items-center justify-between px-1">
        <span className="section-label">Modo de juego</span>
      </div>
      <GameModeSwitcher
        mode={mode}
        onChange={setMode}
        infiniteEnabled={infiniteEnabled}
        onToggleInfinite={(v) => {
          setInfiniteEnabled(v);
          if (!v) setEndlessSummary(null);
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3 rounded-3xl border border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-end gap-3">
          <div className="section-label">Archivo</div>
          <div className="text-xs text-muted-foreground">
            {archiveDateKey ? `Abierto en ${formatDateLabel(activeDateKey)}` : "Solo días anteriores"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setArchiveModalOpen(true)}
          className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          {archiveDateKey ? "Cambiar día" : "Abrir selector"}
        </button>
      </div>

      <section className={`mb-6 mt-6 ${shake ? "animate-shake" : ""}`}>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="section-label">Tu turno</span>
          <span className="ua-meta">
            {infiniteEnabled
              ? `${currentRoundLabel} · ${endlessState.livesLeft} vidas`
              : hasEnded
                ? "Caso resuelto"
                : archiveDateKey
                  ? `Archivo · ${formatDateLabel(activeDateKey)}`
                  : `Intento ${attempts.length + 1}`}
          </span>
        </div>
        {charactersQ.isLoading ? (
          <div className="panel-info p-4 text-center text-sm text-muted-foreground">
            Cargando héroes...
          </div>
        ) : (
          <CharacterSearch
            characters={charactersQ.data ?? []}
            excludeIds={excludeIds}
            disabled={hasEnded}
            onPick={handleGuess}
          />
        )}
        {!hasEnded && (
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            <button
              type="button"
              onClick={handleSurrender}
              className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-accent hover:bg-accent hover:text-accent-foreground"
            >
              Rendirse y revelar héroe
            </button>
            {/* {infiniteEnabled && <span className="ua-meta self-center">Fallos restantes: {endlessState.livesLeft}</span>} */}
          </div>
        )}
      </section>

      <ModeShowcasePanel target={target} attemptCount={attempts.length} won={won} mode={mode} />

      {target && hasEnded && (
        <section className="panel-hero glow-hero mb-5 animate-pop-in p-5 text-center">
          <div className="mb-3 flex items-center justify-center">
            <span
              className="chip"
              style={{
                background: surrendered
                  ? "color-mix(in oklab, var(--wrong) 18%, transparent)"
                  : "color-mix(in oklab, var(--correct) 18%, transparent)",
                color: surrendered ? "var(--wrong)" : "var(--correct)",
                borderColor: surrendered
                  ? "color-mix(in oklab, var(--wrong) 34%, transparent)"
                  : "color-mix(in oklab, var(--correct) 34%, transparent)",
              }}
            >
              {infiniteEnabled
                ? endlessState.phase === "gameover"
                  ? "Fin de la ronda"
                  : surrendered
                    ? "Rendición"
                    : "¡Resuelto!"
                : surrendered
                  ? "Rendición"
                  : "¡Plus Ultra!"}
            </span>
          </div>
          {target.image_url && (
            <div className="mx-auto mb-4 size-28 overflow-hidden rounded-full border border-border bg-secondary/60 shadow-[0_18px_34px_-24px_color-mix(in_oklab,var(--hero)_65%,transparent)]">
              <img src={target.image_url} alt={target.name} className="size-full object-cover" />
            </div>
          )}
          <h2 className="font-display text-4xl text-foreground sm:text-5xl">{target.name}</h2>
          {target.aliases?.[0] && (
            <p className="mt-1 text-sm text-muted-foreground">«{target.aliases[0]}»</p>
          )}
          {infiniteEnabled ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-foreground/90">
                Rondas superadas: <strong>{endlessState.roundsCompleted}</strong> · Vidas restantes: <strong>{endlessState.livesLeft}</strong>
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {infiniteModeLabel} · infinito activo
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {endlessState.phase === "revealed" && endlessState.result === "won" && (
                  <button
                    type="button"
                    onClick={handleNextEndlessRound}
                    className="btn-hero focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm"
                  >
                    Siguiente héroe
                  </button>
                )}
                {(endlessState.phase === "gameover" || endlessState.result === "surrendered") && (
                  <button
                    type="button"
                    onClick={handleResetEndless}
                    className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Reiniciar infinito
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm text-foreground/90">
                Resuelto en <strong>{attempts.length}</strong> {attempts.length === 1 ? "intento" : "intentos"} · Racha <strong>{stats.streak}</strong> 🔥
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <ShareButton puzzleNumber={puzzleNumberForDate(activeDateKey)} attempts={attempts} target={target} />
                <button
                  type="button"
                  onClick={handlePreviousDay}
                  disabled={activeDateKey <= LAUNCH_DATE_KEY}
                  className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Jugar día anterior
                </button>
              </div>
            </>
          )}
        </section>
      )}


      <AttemptsTable attempts={attempts} target={target} />

        {target && !infiniteEnabled && (
          <div className="mt-4 flex items-center justify-between gap-3 px-1">
            <div>
              <div className="section-label">Pistas</div>
              <div className="text-xs text-muted-foreground">Detalles del personaje que complementan el modo principal</div>
            </div>
            <button
              type="button"
              onClick={() => setHintsVisible((value) => !value)}
              className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {hintsVisible ? "Ocultar pistas" : "Mostrar pistas"}
            </button>
          </div>
        )}

        {hintsVisible && !infiniteEnabled && target && (
          <div className="mb-5 mt-3">
            <HintPanel target={target} attemptCount={attempts.length} won={won} mode={mode} />
          </div>
        )}

        {infiniteEnabled && (
          <div className="mt-4 flex items-center justify-between gap-3 px-1">
            <div>
              <div className="section-label">Pistas</div>
              <div className="text-xs text-muted-foreground">No disponibles en el modo infinito</div>
            </div>
          </div>
        )}

      {attempts.length === 0 && !charactersQ.isLoading && !hasEnded && (
        <div className="panel-info mt-6 p-5 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Empieza escribiendo el nombre de un héroe…
        </div>
      )}

      <SupportFooter />

      {endlessSummary && (
        <EndlessSummaryDialog
          open={true}
          modeLabel={infiniteModeLabel}
          roundsCompleted={endlessSummary.roundsCompleted}
          previousRecord={endlessSummary.previousRecord}
          bestRecord={endlessSummary.bestRecord}
          isNewRecord={endlessSummary.isNewRecord}
          onOpenChange={(open) => {
            if (!open) setEndlessSummary(null);
          }}
          onReset={handleResetEndless}
        />
      )}

      <ArchiveDateModal
        open={archiveModalOpen}
        selectedDateKey={archiveDateKey ?? activeDateKey}
        onOpenChange={setArchiveModalOpen}
        onSelectDate={(dateKey) => {
          setArchiveDateKey(dateKey);
          setAttempts([]);
          setWon(false);
          setSurrendered(false);
        }}
        onClearDate={() => {
          setArchiveDateKey(null);
          setArchiveModalOpen(false);
          setAttempts([]);
          setWon(false);
          setSurrendered(false);
        }}
      />
    </main>
  );
}
