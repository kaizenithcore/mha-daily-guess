import { Grid3x3, UserRound, Quote, Infinity } from "lucide-react";

export type GameMode = "classic" | "silhouette" | "quote";

// Each index tab is its own coloured card stock; the open one gets a strong top edge.
const MODES: Array<{
  id: GameMode;
  label: string;
  icon: typeof Grid3x3;
  stock: string;
  strong: string;
}> = [
  { id: "classic", label: "Clásico", icon: Grid3x3, stock: "#cfe0f5", strong: "var(--pen)" },
  { id: "silhouette", label: "Silueta", icon: UserRound, stock: "#d9d6ec", strong: "#4b3f8f" },
  { id: "quote", label: "Cita", icon: Quote, stock: "#f6d5dc", strong: "var(--redpen)" },
];

interface Props {
  mode: GameMode;
  onChange: (m: GameMode) => void;
  infiniteEnabled?: boolean;
  onToggleInfinite?: (v: boolean) => void;
}

export function GameModeSwitcher({
  mode,
  onChange,
  infiniteEnabled = false,
  onToggleInfinite,
}: Props) {
  return (
    <div className="nb-tabs" role="tablist" aria-label="Modo de juego">
      {MODES.map(({ id, label, icon: Icon, stock, strong }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mode === id}
          onClick={() => onChange(id)}
          className="nb-tab"
          style={
            {
              ["--tab-stock" as string]: stock,
              ["--tab-stock-strong" as string]: strong,
            } as React.CSSProperties
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span>{label}</span>
        </button>
      ))}

      <button
        type="button"
        aria-pressed={infiniteEnabled}
        onClick={() => onToggleInfinite?.(!infiniteEnabled)}
        className="nb-tab nb-tab-toggle"
        style={{ ["--tab-stock" as string]: "#d6ecd0" } as React.CSSProperties}
        title={infiniteEnabled ? "Desactivar modo infinito" : "Activar modo infinito"}
      >
        <Infinity className="size-4 shrink-0" aria-hidden />
        <span>Infinito</span>
      </button>
    </div>
  );
}
