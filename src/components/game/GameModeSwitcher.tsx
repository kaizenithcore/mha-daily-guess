import { Grid3x3, UserRound, Quote, Infinity } from "lucide-react";

export type GameMode = "classic" | "silhouette" | "quote";

const MODES: Array<{ id: GameMode; label: string; icon: typeof Grid3x3; tag: string }> = [
  { id: "classic", label: "Clásico", icon: Grid3x3, tag: "Atributos" },
  { id: "silhouette", label: "Silueta", icon: UserRound, tag: "Visual" },
  { id: "quote", label: "Cita", icon: Quote, tag: "Voz" },
];

interface Props {
  mode: GameMode;
  onChange: (m: GameMode) => void;
  infiniteEnabled?: boolean;
  onToggleInfinite?: (v: boolean) => void;
}

export function GameModeSwitcher({ mode, onChange, infiniteEnabled = false, onToggleInfinite }: Props) {
  return (
    <div className="ua-tabs grid-cols-2 sm:grid-cols-4" role="tablist" aria-label="Modo de juego">
      {MODES.map(({ id, label, icon: Icon, tag }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`ua-tab focus-ring ${active ? "ua-tab-active" : ""}`}
          >
            <Icon className="size-4" />
            <span className="font-display tracking-wider text-base leading-none">{label}</span>
            <span className="ua-tab-meta">{tag}</span>
          </button>
        );
      })}

      <button
        role="tab"
        aria-selected={infiniteEnabled}
        onClick={() => onToggleInfinite?.(!infiniteEnabled)}
        className={`ua-tab focus-ring ${infiniteEnabled ? "ua-tab-active" : ""}`}
        style={
          infiniteEnabled
            ? undefined
            : { opacity: 0.78, borderStyle: "dashed", filter: "saturate(0.75)" }
        }
      >
        <Infinity className="size-4" />
        <span className="font-display tracking-wider text-base leading-none">Infinito</span>
        <span className="ua-tab-meta">{infiniteEnabled ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
