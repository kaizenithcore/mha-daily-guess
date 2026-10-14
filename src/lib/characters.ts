// Static character roster. Exported from the old Supabase `characters` table;
// ids are kept as-is because the daily pick and saved progress depend on them.
// To add a character: append it to src/data/characters.json (new uuid) and drop
// its portrait at src/assets/characters/<id>.webp.
import rawCharacters from "@/data/characters.json";

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  gender: string | null;
  age: number | null;
  height: number | null; // cm
  quirk_type: string | null; // Emisor | Transformación | Mutante | Sin don
  affiliation: string | null;
  nationality: string | null;
  first_appearance_season: number | null;
  quote: string | null;
  image_url: string | null;
}

const portraits = import.meta.glob<string>("../assets/characters/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

function portraitFor(id: string): string | null {
  return portraits[`../assets/characters/${id}.webp`] ?? null;
}

export const CHARACTERS: Character[] = (rawCharacters as Omit<Character, "image_url">[])
  .map((c) => ({ ...c, image_url: portraitFor(c.id) }))
  .sort((a, b) => a.name.localeCompare(b.name));
