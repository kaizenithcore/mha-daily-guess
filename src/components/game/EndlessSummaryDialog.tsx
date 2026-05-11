import { Trophy, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  modeLabel: string;
  roundsCompleted: number;
  previousRecord: number;
  bestRecord: number;
  isNewRecord: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export function EndlessSummaryDialog({
  open,
  modeLabel,
  roundsCompleted,
  previousRecord,
  bestRecord,
  isNewRecord,
  onOpenChange,
  onReset,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border bg-background p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-foreground">Fin del reto infinito</DialogTitle>
          <DialogDescription>
            {modeLabel} terminó con {roundsCompleted} {roundsCompleted === 1 ? "ronda" : "rondas"} completadas.
          </DialogDescription>
        </DialogHeader>

        <div className="panel-info space-y-4 p-4">
          <div className="flex items-center gap-2">
            <span className={`chip ${isNewRecord ? "chip-red" : ""}`}>
              {isNewRecord ? <Sparkles className="size-3" /> : <Trophy className="size-3" />}
              {isNewRecord ? "Nuevo récord" : "Marca guardada"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-secondary/70 p-3 text-center">
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Anterior</div>
              <div className="mt-1 font-display text-3xl text-foreground">{previousRecord}</div>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/70 p-3 text-center">
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Mejor</div>
              <div className="mt-1 font-display text-3xl text-foreground">{bestRecord}</div>
            </div>
          </div>
          <div className={`rounded-2xl border px-3 py-2 text-sm ${isNewRecord ? "border-emerald-500/30 bg-emerald-500/10 text-foreground" : "border-border bg-secondary/70 text-foreground"}`}>
            {isNewRecord ? "Has superado tu mejor marca." : "No has superado tu mejor marca esta vez."}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button type="button" onClick={onReset}>
            <RotateCcw className="size-4" />
            Reiniciar infinito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
