import { MAX_SEASON } from "@/lib/spoilers";
import type { AttemptComparison, Character } from "@/lib/mhadle";
import { compareCharacters } from "@/lib/mhadle";

const EMOJI = {
  correct: "🟩",
  partial: "🟨",
  wrong: "🟥",
} as const;

const ARROW = { higher: "⬆️", lower: "⬇️", equal: "" } as const;

const KEYS: Array<keyof AttemptComparison> = [
  "gender",
  "age",
  "height",
  "quirk_type",
  "affiliation",
  "nationality",
  "first_appearance_season",
];

export function buildShareText(opts: {
  puzzleNumber: number;
  season?: number;
  attempts: Character[];
  target: Character;
}) {
  const { puzzleNumber, attempts, target, season } = opts;
  const level = season && season < MAX_SEASON ? ` · hasta T${season}` : "";
  const grid = attempts
    .map((g) => {
      const cmp = compareCharacters(g, target);
      return KEYS.map((k) => {
        const cell = cmp[k];
        const emoji = EMOJI[cell.status];
        const arrow = "hint" in cell && cell.hint ? ARROW[cell.hint] : "";
        return emoji + arrow;
      }).join("");
    })
    .join("\n");

  const url = typeof window !== "undefined" ? `${window.location.origin}/?ref=compartir` : "https://mhadle.app";

  return `MHAdle #${puzzleNumber}${level} — ${attempts.length} ${
    attempts.length === 1 ? "intento" : "intentos"
  }\n\n${grid}\n\n${url}`;
}
