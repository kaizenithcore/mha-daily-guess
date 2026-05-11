import type { Tables } from "@/integrations/supabase/types";

export type Character = Tables<"characters">;

export type Comparison = "correct" | "partial" | "wrong";
export type NumericHint = "higher" | "lower" | "equal";

export interface AttemptComparison {
  gender: { value: string | null; status: Comparison };
  age: { value: number | null; status: Comparison; hint: NumericHint | null };
  height: { value: number | null; status: Comparison; hint: NumericHint | null };
  quirk_type: { value: string | null; status: Comparison };
  affiliation: { value: string | null; status: Comparison };
  nationality: { value: string | null; status: Comparison };
  first_appearance_season: { value: number | null; status: Comparison };
}

const cmpString = (a: string | null, b: string | null): Comparison => {
  if (!a || !b) return "wrong";
  return a.trim().toLowerCase() === b.trim().toLowerCase() ? "correct" : "wrong";
};

const cmpNumeric = (
  guess: number | null,
  target: number | null,
  closeRange: number,
): { status: Comparison; hint: NumericHint | null } => {
  if (guess == null || target == null) return { status: "wrong", hint: null };
  if (guess === target) return { status: "correct", hint: "equal" };
  const diff = Math.abs(guess - target);
  const status: Comparison = diff <= closeRange ? "partial" : "wrong";
  const hint: NumericHint = guess < target ? "higher" : "lower";
  return { status, hint };
};

const cmpSeason = (
  guess: number | null,
  target: number | null,
): { status: Comparison } => {
  if (guess == null || target == null) return { status: "wrong" };
  if (guess === target) return { status: "correct" };
  return { status: Math.abs(guess - target) <= 1 ? "partial" : "wrong" };
};

export function compareCharacters(
  guess: Character,
  target: Character,
): AttemptComparison {
  const ageCmp = cmpNumeric(guess.age, target.age, 3);
  const heightCmp = cmpNumeric(guess.height, target.height, 8);
  const seasonCmp = cmpSeason(guess.first_appearance_season, target.first_appearance_season);
  return {
    gender: { value: guess.gender, status: cmpString(guess.gender, target.gender) },
    age: { value: guess.age, status: ageCmp.status, hint: ageCmp.hint },
    height: { value: guess.height, status: heightCmp.status, hint: heightCmp.hint },
    quirk_type: { value: guess.quirk_type, status: cmpString(guess.quirk_type, target.quirk_type) },
    affiliation: { value: guess.affiliation, status: cmpString(guess.affiliation, target.affiliation) },
    nationality: { value: guess.nationality, status: cmpString(guess.nationality, target.nationality) },
    first_appearance_season: {
      value: guess.first_appearance_season,
      status: seasonCmp.status,
    },
  };
}

/** Today key in UTC (YYYY-MM-DD). Daily reset at 00:00 UTC. */
export function todayKeyUTC(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setUTCDate(d.getUTCDate() + offsetDays);
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

export function dateToKeyUTC(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .slice(0, 10);
}

export function shiftDateKey(dateKey: string, offsetDays: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

/** ms until next 00:00 UTC */
export function msUntilNextUTCMidnight(now: Date = new Date()): number {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0,
  );
  return next - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ---- Local stats ----
export interface LocalStats {
  streak: number;
  bestStreak: number;
  wins: number;
  totalAttempts: number;
  lastWonDate: string | null;
}

const STATS_KEY = "mhadle:stats";
const TODAY_STATE_KEY = "mhadle:today";
const INFINITE_ENABLED_KEY = "mhadle:infinite-enabled";

function todayStateStorageKey(scope: string, dateKey: string): string {
  return `${TODAY_STATE_KEY}:${scope}:${dateKey}`;
}

export function loadStats(): LocalStats {
  if (typeof window === "undefined") {
    return { streak: 0, bestStreak: 0, wins: 0, totalAttempts: 0, lastWonDate: null };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) throw new Error("none");
    return JSON.parse(raw) as LocalStats;
  } catch {
    return { streak: 0, bestStreak: 0, wins: 0, totalAttempts: 0, lastWonDate: null };
  }
}

export function recordWin(attempts: number, dayKey = todayKeyUTC()): LocalStats {
  const stats = loadStats();
  const today = dayKey;
  if (stats.lastWonDate === today) return stats;

  // streak continues if last win was yesterday UTC
  const yesterday = (() => {
    const d = new Date(`${today}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const newStreak = stats.lastWonDate === yesterday ? stats.streak + 1 : 1;
  const next: LocalStats = {
    streak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    wins: stats.wins + 1,
    totalAttempts: stats.totalAttempts + attempts,
    lastWonDate: today,
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
  return next;
}

// Persist today's attempts so refreshing doesn't lose progress
export interface TodayState {
  date: string;
  attemptIds: string[];
  won: boolean;
  surrendered: boolean;
}

export function loadTodayState(scope = "classic", dateKey = todayKeyUTC()): TodayState {
  const empty: TodayState = { date: dateKey, attemptIds: [], won: false, surrendered: false };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(todayStateStorageKey(scope, dateKey));
    if (!raw && scope === "classic" && dateKey === todayKeyUTC()) {
      const legacy = localStorage.getItem(TODAY_STATE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy) as TodayState;
        if (parsedLegacy.date === dateKey) {
          return { ...empty, ...parsedLegacy };
        }
      }
    }
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as TodayState;
    if (parsed.date !== dateKey) return empty;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

export function saveTodayState(state: TodayState, scope = "classic", dateKey = todayKeyUTC()) {
  if (typeof window === "undefined") return;
  localStorage.setItem(todayStateStorageKey(scope, dateKey), JSON.stringify(state));
  if (scope === "classic" && dateKey === todayKeyUTC()) {
    localStorage.setItem(TODAY_STATE_KEY, JSON.stringify(state));
  }
}

export function loadInfiniteEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(INFINITE_ENABLED_KEY) === "true";
}

export function saveInfiniteEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INFINITE_ENABLED_KEY, String(enabled));
}

export type EndlessPhase = "playing" | "revealed" | "gameover";

export interface EndlessState {
  roundIndex: number;
  attemptIds: string[];
  livesLeft: number;
  roundsCompleted: number;
  phase: EndlessPhase;
  result: "won" | "surrendered" | "lost" | null;
}

const ENDLESS_STATE_KEY = "mhadle:endless";
const ENDLESS_RECORD_KEY = "mhadle:endless-record";
const ENDLESS_DEFAULT_STATE: EndlessState = {
  roundIndex: 0,
  attemptIds: [],
  livesLeft: 5,
  roundsCompleted: 0,
  phase: "playing",
  result: null,
};

function endlessStateStorageKey(scope: string, dateKey: string): string {
  return `${ENDLESS_STATE_KEY}:${scope}:${dateKey}`;
}

function endlessRecordStorageKey(scope: string, dateKey: string): string {
  return `${ENDLESS_RECORD_KEY}:${scope}:${dateKey}`;
}

export function loadEndlessState(scope = "classic", dateKey = todayKeyUTC()): EndlessState {
  if (typeof window === "undefined") return ENDLESS_DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(endlessStateStorageKey(scope, dateKey));
    if (!raw) return ENDLESS_DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<EndlessState>;
    return {
      ...ENDLESS_DEFAULT_STATE,
      ...parsed,
      attemptIds: Array.isArray(parsed.attemptIds) ? parsed.attemptIds : [],
      livesLeft: typeof parsed.livesLeft === "number" ? parsed.livesLeft : 5,
      roundsCompleted: typeof parsed.roundsCompleted === "number" ? parsed.roundsCompleted : 0,
      phase: parsed.phase === "revealed" || parsed.phase === "gameover" ? parsed.phase : "playing",
      result:
        parsed.result === "won" || parsed.result === "surrendered" || parsed.result === "lost"
          ? parsed.result
          : null,
      roundIndex: typeof parsed.roundIndex === "number" ? parsed.roundIndex : 0,
    };
  } catch {
    return ENDLESS_DEFAULT_STATE;
  }
}

export function saveEndlessState(state: EndlessState, scope = "classic", dateKey = todayKeyUTC()) {
  if (typeof window === "undefined") return;
  localStorage.setItem(endlessStateStorageKey(scope, dateKey), JSON.stringify(state));
}

export function resetEndlessState(scope = "classic", dateKey = todayKeyUTC()): EndlessState {
  if (typeof window !== "undefined") {
    localStorage.setItem(endlessStateStorageKey(scope, dateKey), JSON.stringify(ENDLESS_DEFAULT_STATE));
  }
  return ENDLESS_DEFAULT_STATE;
}

export interface EndlessRecordSummary {
  previousRecord: number;
  bestRecord: number;
  isNewRecord: boolean;
}

export function loadEndlessRecord(scope = "classic", dateKey = todayKeyUTC()): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(endlessRecordStorageKey(scope, dateKey));
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "number" && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function updateEndlessRecord(
  scope = "classic",
  dateKey = todayKeyUTC(),
  roundsCompleted: number,
): EndlessRecordSummary {
  const previousRecord = loadEndlessRecord(scope, dateKey);
  const bestRecord = Math.max(previousRecord, roundsCompleted);
  if (typeof window !== "undefined" && bestRecord !== previousRecord) {
    localStorage.setItem(endlessRecordStorageKey(scope, dateKey), JSON.stringify(bestRecord));
  }
  return {
    previousRecord,
    bestRecord,
    isNewRecord: roundsCompleted > previousRecord,
  };
}
