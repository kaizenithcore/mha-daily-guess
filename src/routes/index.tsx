import { createFileRoute } from "@tanstack/react-router";
import { streakBucket, track } from "../lib/analytics";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { CHARACTERS } from "@/lib/characters";
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
  LAUNCH_DATE_KEY,
  migrateStorage,
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
import {
  MAX_SEASON,
  charactersUpTo,
  loadSpoilerSeason,
  saveSpoilerSeason,
  scopeFor,
} from "@/lib/spoilers";
import { SpoilerSelect } from "@/components/game/SpoilerSelect";

export const Route = createFileRoute("/")({
  component: Index,
});

// Runs once on the client before the page reads any saved progress.
migrateStorage();

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

function buildModeTargets(
  characters: Character[],
  dayKey: string,
): Record<GameMode, Character | null> {
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

function buildEndlessTarget(
  characters: Character[],
  mode: GameMode,
  dayKey: string,
  roundIndex: number,
): Character | null {
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
  const [hintsVisible, setHintsVisible] = useState(false);
  const [spoilerSeason, setSpoilerSeason] = useState(MAX_SEASON);
  const [endlessState, setEndlessState] = useState<EndlessState>(() =>
    loadEndlessState(mode, todayKeyUTC()),
  );
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
    setSpoilerSeason(loadSpoilerSeason());
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

  // Roster is bundled statically (no backend), limited to what the player has watched.
  const pool = useMemo(() => charactersUpTo(CHARACTERS, spoilerSeason), [spoilerSeason]);
  const charactersQ = { data: pool, isLoading: false };
  // Saved progress is kept per mode and per spoiler level.
  const scope = scopeFor(mode, spoilerSeason);

  const target = useMemo<Character | null>(() => {
    if (!charactersQ.data) return null;
    if (infiniteEnabled) {
      return buildEndlessTarget(charactersQ.data, mode, activeDateKey, endlessState.roundIndex);
    }
    const targets = buildModeTargets(charactersQ.data, activeDateKey);
    return targets[mode];
  }, [charactersQ.data, activeDateKey, infiniteEnabled, mode, endlessState.roundIndex]);

  // Restore progress for the active mode and day/run
  useEffect(() => {
    if (!charactersQ.data) return;
    const map = new Map(charactersQ.data.map((c) => [c.id, c]));

    if (infiniteEnabled) {
      const state = loadEndlessState(scope, activeDateKey);
      setEndlessState(state);
      const restored = state.attemptIds.map((id) => map.get(id)).filter(Boolean) as Character[];
      setAttempts(restored);
      setWon(state.phase === "revealed" && state.result === "won");
      setSurrendered(state.phase === "revealed" && state.result === "surrendered");
      setHintsVisible(false);
      return;
    }

    const t = loadTodayState(scope, activeDateKey);
    const restored = t.attemptIds.map((id) => map.get(id)).filter(Boolean) as Character[];
    setAttempts(restored);
    setWon(t.won);
    setSurrendered(t.surrendered);
    setEndlessSummary(null);
  }, [charactersQ.data, activeDateKey, scope, infiniteEnabled]);

  const excludeIds = useMemo(() => new Set(attempts.map((a) => a.id)), [attempts]);

  const currentRoundLabel = infiniteEnabled
    ? `Ronda ${endlessState.roundIndex + 1}`
    : `Intento ${attempts.length + 1}`;

  const hasEnded = infiniteEnabled ? endlessState.phase !== "playing" : won || surrendered;

  const infiniteModeLabel = MODE_LABELS[mode];

  const revealHero = (nextWon: boolean, nextSurrendered: boolean) => {
    setWon(nextWon);
    setSurrendered(nextSurrendered);
  };

  const persistDailyState = (
    nextAttempts: Character[],
    nextWon: boolean,
    nextSurrendered: boolean,
  ) => {
    saveTodayState(
      {
        date: activeDateKey,
        attemptIds: nextAttempts.map((a) => a.id),
        won: nextWon,
        surrendered: nextSurrendered,
      },
      scope,
      activeDateKey,
    );
  };

  const persistEndlessState = (nextState: EndlessState) => {
    setEndlessState(nextState);
    saveEndlessState(nextState, scope, activeDateKey);
  };

  const openEndlessSummary = (nextState: EndlessState) => {
    const record = updateEndlessRecord(scope, activeDateKey, nextState.roundsCompleted);
    setEndlessSummary({
      roundsCompleted: nextState.roundsCompleted,
      previousRecord: record.previousRecord,
      bestRecord: record.bestRecord,
      isNewRecord: record.isNewRecord,
    });
  };

  const handleGuess = (c: Character) => {
    if (!target || hasEnded) return;
    if (attempts.length === 0) {
      track("partida_iniciada", { modo: mode, infinito: infiniteEnabled, spoilers: spoilerSeason, racha: streakBucket(stats.streak) });
    }
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
        track("partida_ganada", { modo: mode, infinito: true, ronda: nextState.roundsCompleted, intentos: nextAttempts.length });
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
        track("partida_perdida", { modo: mode, infinito: true, rondas: endlessState.roundsCompleted });
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
      track("partida_ganada", { modo: mode, infinito: false, intentos: next.length, archivo: activeDateKey !== todayKeyUTC() });
      setStats(recordWin(next.length, activeDateKey));
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleSurrender = () => {
    if (!target || hasEnded) return;
    track("partida_abandonada", { modo: mode, infinito: infiniteEnabled, intentos: attempts.length });
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
    if (!infiniteEnabled || endlessState.phase !== "revealed" || endlessState.result !== "won")
      return;
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
    const nextState = resetEndlessState(scope, activeDateKey);
    setAttempts([]);
    revealHero(false, false);
    setEndlessSummary(null);
    persistEndlessState(nextState);
  };

  return (
    <main className="nb-page mx-auto min-h-screen w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8 min-[720px]:max-w-[44rem] min-[1100px]:max-w-6xl min-[1100px]:pr-12">
      <div className="nb-spread">
        {/* Printed notebook header, filled in by hand */}
        <header className="nb-left mb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="nb-printed">
                Análisis Nº <span className="nb-fill">{puzzleNumberForDate(activeDateKey)}</span>
              </p>
              <SpoilerSelect
                season={spoilerSeason}
                onChange={(season) => {
                  setSpoilerSeason(season);
                  saveSpoilerSeason(season);
                  track("spoilers_cambiado", { temporada: season });
                  setEndlessSummary(null);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setArchiveModalOpen(true)}
              className="nb-link text-base"
            >
              <CalendarDays className="size-4" aria-hidden />
              {archiveDateKey ? `Archivo · ${formatDateLabel(activeDateKey)}` : "Días anteriores"}
            </button>
          </div>
          <h1 className="nb-title mt-2">
            <span className="nb-title-hl">MHA</span>dle
          </h1>
          <p className="mt-1 font-hand text-lg text-pen">Análisis de héroes para el futuro</p>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
            {archiveDateKey ? (
              <span className="inline-flex items-baseline gap-1.5">
                <span className="nb-printed">Día de archivo</span>
                <button
                  type="button"
                  onClick={() => {
                    setArchiveDateKey(null);
                    setAttempts([]);
                    setWon(false);
                    setSurrendered(false);
                  }}
                  className="nb-link"
                >
                  volver a hoy
                </button>
              </span>
            ) : (
              <Countdown onReset={() => location.reload()} />
            )}
            <StatsBar stats={stats} />
          </div>
        </header>

        {/* Today's case: index tabs + the page with the subject and the writing line */}
        <div className="nb-left">
          <GameModeSwitcher
            mode={mode}
            onChange={setMode}
            infiniteEnabled={infiniteEnabled}
            onToggleInfinite={(v) => {
              setInfiniteEnabled(v);
              if (!v) setEndlessSummary(null);
            }}
          />
          <section
            className={`nb-sheet mb-6 ${shake ? "animate-shake" : ""}`}
            aria-label="Caso del día"
          >
            <ModeShowcasePanel
              target={target}
              attemptCount={attempts.length}
              won={won}
              mode={mode}
              revealed={hasEnded}
            />

            <div className="px-4 pb-4 pt-4 sm:px-6">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="nb-printed">
                  {infiniteEnabled ? `Infinito · ${MODE_LABELS[mode]}` : "Tu respuesta"}
                </span>
                <span className="nb-printed">
                  {infiniteEnabled
                    ? `${currentRoundLabel} · ${endlessState.livesLeft} ${endlessState.livesLeft === 1 ? "vida" : "vidas"}`
                    : hasEnded
                      ? "Caso cerrado"
                      : `Intento ${attempts.length + 1}`}
                </span>
              </div>
              <CharacterSearch
                characters={charactersQ.data ?? []}
                excludeIds={excludeIds}
                disabled={hasEnded}
                onPick={handleGuess}
              />
              {!hasEnded && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSurrender}
                    className="nb-link nb-link-red text-base"
                  >
                    Me rindo, revela el héroe
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Conclusion of the case */}
        {target && hasEnded && (
          <section
            className="nb-left nb-sheet nb-impact mb-6 px-4 pb-5 pt-6 text-center sm:px-6"
            aria-live="polite"
          >
            <span className="nb-tape -top-2.5 left-8 rotate-[-6deg]" aria-hidden />
            <span className="nb-tape -top-2.5 right-8 rotate-[5deg]" aria-hidden />
            <span className="sr-only">El héroe era {target.name}.</span>
            <p
              className={`nb-stamp ${surrendered || endlessState.phase === "gameover" ? "text-ink-soft" : "text-redpen"}`}
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
            </p>

            {infiniteEnabled ? (
              <div className="mt-4 space-y-3">
                <p className="font-hand text-lg text-ink">
                  Rondas superadas: <strong>{endlessState.roundsCompleted}</strong> · Vidas:{" "}
                  <strong>{endlessState.livesLeft}</strong>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {endlessState.phase === "revealed" && endlessState.result === "won" && (
                    <button type="button" onClick={handleNextEndlessRound} className="nb-btn">
                      Siguiente héroe
                    </button>
                  )}
                  {(endlessState.phase === "gameover" || endlessState.result === "surrendered") && (
                    <button type="button" onClick={handleResetEndless} className="nb-btn">
                      Reiniciar infinito
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="mt-4 font-hand text-lg text-ink">
                  {surrendered
                    ? `Caso cerrado tras ${attempts.length} ${attempts.length === 1 ? "intento" : "intentos"}.`
                    : `Resuelto en ${attempts.length} ${attempts.length === 1 ? "intento" : "intentos"} · racha de ${stats.streak}.`}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <ShareButton
                    puzzleNumber={puzzleNumberForDate(activeDateKey)}
                    attempts={attempts}
                    target={target}
                    season={spoilerSeason}
                  />
                  {activeDateKey > LAUNCH_DATE_KEY && (
                    <button type="button" onClick={handlePreviousDay} className="nb-link">
                      Jugar el día anterior
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        <div className="nb-right mb-8">
          <AttemptsTable attempts={attempts} target={target} />
          {attempts.length === 0 && (
            <p className="nb-spread-only pt-24 text-center font-hand text-xl text-ink-soft">
              Aquí irán tus análisis.
            </p>
          )}
        </div>

        {target && !infiniteEnabled && (
          <div className="nb-left mt-2">
            {hintsVisible ? (
              <HintPanel target={target} attemptCount={attempts.length} won={won} mode={mode} />
            ) : null}
            <button
              type="button"
              onClick={() => setHintsVisible((value) => !value)}
              className="nb-link mt-2"
            >
              {hintsVisible ? "Ocultar pistas" : "Mostrar pistas"}
            </button>
          </div>
        )}

        {infiniteEnabled && (
          <p className="nb-left nb-printed mt-2">
            Las pistas no están disponibles en el modo infinito.
          </p>
        )}
      </div>

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
        season={spoilerSeason}
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
