import { Grid3x3, UserRound, Quote } from "lucide-react";

export type GameMode = "classic" | "silhouette" | "quote";

const MODES: Array<{ id: GameMode; label: string; icon: typeof Grid3x3; tag: string }> = [
  { id: "classic", label: "Clásico", icon: Grid3x3, tag: "Atributos" },
  { id: "silhouette", label: "Silueta", icon: UserRound, tag: "Visual" },
  { id: "quote", label: "Cita", icon: Quote, tag: "Voz" },
];

interface Props {
  mode: GameMode;
  onChange: (m: GameMode) => void;
}

export function GameModeSwitcher({ mode, onChange }: Props) {
  return (
    <div className="ua-tabs" role="tablist" aria-label="Modo de juego">
      {MODES.map(({ id, label, icon: Icon, tag }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`ua-tab ${active ? "ua-tab-active" : ""}`}
          >
            <Icon className="size-4" />
            <span className="font-display tracking-wider text-base leading-none">{label}</span>
            <span className="ua-tab-meta">{tag}</span>
          </button>
        );
      })}
    </div>
  );
}
