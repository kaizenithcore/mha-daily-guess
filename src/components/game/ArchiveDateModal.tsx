"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { CheckCircle2, Circle, CircleDot, XCircle } from "lucide-react";
import { DayButton as DayPickerDayButton, getDefaultClassNames } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LAUNCH_DATE_KEY, dateToKeyUTC, loadEndlessState, loadTodayState } from "@/lib/mhadle";
import { scopeFor } from "@/lib/spoilers";

interface Props {
  open: boolean;
  selectedDateKey: string;
  onOpenChange: (open: boolean) => void;
  onSelectDate: (dateKey: string) => void;
  onClearDate: () => void;
  /** Spoiler level whose progress the day markers reflect. */
  season: number;
}

const LAUNCH_DATE = new Date(`${LAUNCH_DATE_KEY}T00:00:00.000Z`);
const DAY_MODES: Array<"classic" | "silhouette" | "quote"> = ["classic", "silhouette", "quote"];

const SeasonContext = createContext(8);

type DayStatus = "empty" | "played" | "won" | "lost";

function keyToDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function getDayStatus(dateKey: string, season: number): DayStatus {
  let played = false;
  let won = false;
  let lost = false;

  for (const mode of DAY_MODES) {
    const daily = loadTodayState(scopeFor(mode, season), dateKey);
    if (daily.attemptIds.length > 0) played = true;
    if (daily.won) won = true;
    if (daily.surrendered) lost = true;

    const endless = loadEndlessState(scopeFor(mode, season), dateKey);
    if (endless.attemptIds.length > 0) played = true;
    if (endless.result === "won") won = true;
    if (endless.result === "lost" || endless.result === "surrendered") lost = true;
  }

  if (won) return "won";
  if (lost) return "lost";
  if (played) return "played";
  return "empty";
}

function DayStatusIcon({ status }: { status: DayStatus }) {
  switch (status) {
    case "won":
      return <CheckCircle2 className="size-3 text-[#2f8a3c]" />;
    case "lost":
      return <XCircle className="size-3 text-redpen" />;
    case "played":
      return <CircleDot className="size-3 text-pen" />;
    default:
      return <Circle className="size-3 text-muted-foreground/70" />;
  }
}

function LegendItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border bg-sheet px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
      {icon}
      {label}
    </span>
  );
}

function ArchiveDayButton({
  className,
  day,
  modifiers,
  ...props
}: Parameters<typeof DayPickerDayButton>[0]) {
  const defaultClassNames = getDefaultClassNames();
  const season = useContext(SeasonContext);
  const status = getDayStatus(dateToKeyUTC(day.date), season);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      aria-label={`${day.date.getDate()} ${status}`}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-0.5 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    >
      <span className="text-xs">{day.date.getDate()}</span>
      <span aria-hidden className="flex items-center justify-center">
        <DayStatusIcon status={status} />
      </span>
    </Button>
  );
}

export function ArchiveDateModal({
  open,
  selectedDateKey,
  onOpenChange,
  onSelectDate,
  onClearDate,
  season,
}: Props) {
  const selectedDate = keyToDate(selectedDateKey);

  return (
    <SeasonContext.Provider value={season}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl border-border bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-foreground">
              Archivo de días
            </DialogTitle>
            <DialogDescription>
              Elige un día anterior para abrir el reto de esa fecha. Las marcas indican si ya se
              jugó, se ganó o se perdió.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <LegendItem
              icon={<Circle className="size-3.5 text-muted-foreground/70" />}
              label="Sin jugar"
            />
            <LegendItem icon={<CircleDot className="size-3.5 text-pen" />} label="Jugado" />
            <LegendItem
              icon={<CheckCircle2 className="size-3.5 text-[#2f8a3c]" />}
              label="Ganado"
            />
            <LegendItem icon={<XCircle className="size-3.5 text-redpen" />} label="Perdido" />
          </div>

          <div className="panel-info overflow-hidden p-2 sm:p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate}
              onSelect={(date) => {
                if (!date) return;
                const key = dateToKeyUTC(date);
                if (key < LAUNCH_DATE_KEY) return;
                onSelectDate(key);
                onOpenChange(false);
              }}
              disabled={{ after: new Date() }}
              fromDate={LAUNCH_DATE}
              className="w-full"
              components={{ DayButton: ArchiveDayButton }}
            />
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-3 sm:justify-between">
            <div className="ua-meta">Seleccionado: {selectedDate.toLocaleDateString("es-ES")}</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={onClearDate}>
                Volver a hoy
              </Button>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SeasonContext.Provider>
  );
}
