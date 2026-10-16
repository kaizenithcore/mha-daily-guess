import { useEffect, useMemo, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import type { Character } from "@/lib/mhadle";

interface Props {
  characters: Character[];
  excludeIds: Set<string>;
  disabled?: boolean;
  onPick: (c: Character) => void;
}

export function CharacterSearch({ characters, excludeIds, disabled, onPick }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [wrote, setWrote] = useState(0); // bumps to replay the pen scribble
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return characters
      .filter((c) => !excludeIds.has(c.id))
      .filter((c) => {
        if (c.name.toLowerCase().includes(term)) return true;
        return c.aliases?.some((a) => a.toLowerCase().includes(term));
      })
      .slice(0, 8);
  }, [q, characters, excludeIds]);

  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (c: Character) => {
    onPick(c);
    setWrote((n) => n + 1);
    setQ("");
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <label className="nb-writeline">
        <PenLine
          key={wrote}
          className={`size-5 shrink-0 text-ink ${wrote ? "nb-scribble" : ""}`}
          aria-hidden
        />
        <span className="sr-only">Nombre del héroe</span>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!suggestions.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              pick(suggestions[activeIdx]);
            }
          }}
          disabled={disabled}
          placeholder={disabled ? "Caso cerrado por hoy" : "Escribe un héroe…"}
          className="disabled:opacity-60"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="hero-suggestions"
          aria-autocomplete="list"
        />
      </label>

      {open && suggestions.length > 0 && (
        <ul
          id="hero-suggestions"
          role="listbox"
          className="nb-sheet nb-suggest absolute z-30 mt-1 max-h-[60vh] w-full overflow-y-auto divide-y divide-dashed divide-border"
        >
          {suggestions.map((c, i) => (
            <li
              key={c.id}
              role="option"
              aria-selected={i === activeIdx}
              style={{ ["--i" as string]: i } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => pick(c)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  i === activeIdx ? "bg-hl-yellow/45" : "hover:bg-hl-yellow/25"
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden bg-[#d9e1ec] font-display text-sm text-ink">
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="size-full object-cover" />
                  ) : (
                    c.name[0]
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-hand text-lg font-bold leading-tight text-ink">
                    {c.name}
                  </div>
                  {c.aliases?.[0] && (
                    <div className="truncate text-sm text-ink-soft">{c.aliases[0]}</div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
