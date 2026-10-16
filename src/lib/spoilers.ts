// Spoiler control: the player says how far they have watched the anime and the
// pool of possible heroes (and the search list) only contains characters who
// debut up to that season. Each level is its own daily puzzle, so its saved
// progress lives under its own storage scope.
import type { Character } from "@/lib/characters";

export const MAX_SEASON = 8; // the anime ended with season 8
const SPOILER_KEY = "mhadle:spoiler-season";

export function loadSpoilerSeason(): number {
  if (typeof window === "undefined") return MAX_SEASON;
  try {
    const n = Number(localStorage.getItem(SPOILER_KEY));
    return Number.isInteger(n) && n >= 1 && n <= MAX_SEASON ? n : MAX_SEASON;
  } catch {
    return MAX_SEASON;
  }
}

export function saveSpoilerSeason(season: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SPOILER_KEY, String(season));
  } catch {
    // storage unavailable: the choice just won't persist
  }
}

export function charactersUpTo(characters: Character[], season: number): Character[] {
  return characters.filter((c) => (c.first_appearance_season ?? 1) <= season);
}

/** Storage scope for a mode at a spoiler level. The full-series level keeps the plain mode key. */
export function scopeFor(mode: string, season: number): string {
  return season >= MAX_SEASON ? mode : `${mode}@t${season}`;
}
