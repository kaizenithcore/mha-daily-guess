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
export function todayKeyUTC(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
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

export function recordWin(attempts: number): LocalStats {
  const stats = loadStats();
  const today = todayKeyUTC();
  if (stats.lastWonDate === today) return stats;

  // streak continues if last win was yesterday UTC
  const yesterday = (() => {
    const d = new Date();
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
}

export function loadTodayState(): TodayState {
  const empty: TodayState = { date: todayKeyUTC(), attemptIds: [], won: false };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(TODAY_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as TodayState;
    if (parsed.date !== todayKeyUTC()) return empty;
    return parsed;
  } catch {
    return empty;
  }
}

export function saveTodayState(state: TodayState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TODAY_STATE_KEY, JSON.stringify(state));
}
