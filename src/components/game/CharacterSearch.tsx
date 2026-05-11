import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
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
    setQ("");
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className={`flex items-center gap-2 panel-input px-4 py-3.5 ${q.length === 0 && !disabled ? "panel-input-idle" : ""}`}>
        <Search className="size-4 shrink-0 text-villain" style={{ color: "var(--villain)" }} />
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
          placeholder={disabled ? "¡Has acertado!" : "Escribe un héroe..."}
          className="flex-1 bg-transparent text-base outline-none disabled:opacity-50"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-[60vh] w-full overflow-y-auto overflow-hidden panel-hero divide-y divide-border rounded-2xl">
          {suggestions.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pick(c)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                  i === activeIdx ? "bg-primary/14" : "hover:bg-primary/8"
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary font-display text-sm text-primary">
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="size-full object-cover" />
                  ) : (
                    c.name[0]
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.name}</div>
                  {c.aliases?.[0] && (
                    <div className="truncate text-xs text-muted-foreground">
                      {c.aliases[0]}
                    </div>
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
