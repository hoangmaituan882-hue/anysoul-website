import { useMemo, useState } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "../lib/utils";

type DateTimePickerMode = "date" | "datetime" | "time";

type DateTimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: DateTimePickerMode;
  placeholder?: string;
  timezoneOffset?: string;
  disabled?: boolean;
};

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
const timeSlots = Array.from({ length: 30 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

function parsePickerDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 20), Number(match[5] || 0));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function buildMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatDisplay(value: string, mode: DateTimePickerMode, placeholder?: string) {
  if (!value) return placeholder || "选择时间";
  if (mode === "time") return value;
  if (!value.match(/^\d{4}-\d{2}-\d{2}/) && Number.isNaN(new Date(value).getTime())) return value;

  const parsed = parsePickerDate(value);
  if (Number.isNaN(parsed.getTime())) return value;

  if (mode === "date") {
    return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

export function DateTimePicker({ label, value, onChange, mode = "datetime", placeholder, timezoneOffset = "+08:00", disabled = false }: DateTimePickerProps) {
  const initialDate = parsePickerDate(value);
  const [open, setOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => initialDate);
  const [selectedTime, setSelectedTime] = useState(() => value.match(/T(\d{2}:\d{2})/)?.[1] || (mode === "time" && value.match(/^\d{2}:\d{2}$/) ? value : formatTimeValue(initialDate)));

  const monthDays = useMemo(() => buildMonthDays(monthDate), [monthDate]);
  const selectedDateValue = formatDateValue(selectedDate);
  const todayValue = formatDateValue(new Date());

  const commit = (date: Date, time = selectedTime, close = mode !== "datetime") => {
    if (disabled) return;

    if (mode === "time") {
      onChange(time);
    } else if (mode === "date") {
      onChange(formatDateValue(date));
    } else {
      onChange(`${formatDateValue(date)}T${time}:00${timezoneOffset}`);
    }

    if (close) setOpen(false);
  };

  return (
    <label className="relative flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 text-left text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>{formatDisplay(value, mode, placeholder)}</span>
        {mode === "time" ? <Clock className="size-4 text-muted-foreground" /> : <Calendar className="size-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl shadow-black/15 dark:shadow-black/50">
          {mode !== "time" && (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))} className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <ChevronLeft className="size-4" />
                </button>
                <div className="text-sm font-black text-foreground">{monthDate.getFullYear()} 年 {monthDate.getMonth() + 1} 月</div>
                <button type="button" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))} className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground">
                {weekDays.map((day) => <div key={day} className="py-1">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date) => {
                  const dateValue = formatDateValue(date);
                  const selected = dateValue === selectedDateValue;
                  const today = dateValue === todayValue;
                  const inactive = date.getMonth() !== monthDate.getMonth();

                  return (
                    <button
                      key={dateValue}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        commit(date, selectedTime, mode === "date");
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl border text-sm font-bold transition-colors",
                        selected ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-transparent hover:border-border hover:bg-muted",
                        today && !selected && "text-primary",
                        inactive && !selected && "text-muted-foreground/45"
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {(mode === "datetime" || mode === "time") && (
            <div className={cn(mode !== "time" && "mt-3 border-t border-border pt-3")}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground"><Clock className="size-3.5" /> 时间表</div>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(event) => {
                    setSelectedTime(event.target.value);
                    commit(selectedDate, event.target.value, false);
                  }}
                  className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-bold text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="grid max-h-32 grid-cols-4 gap-1 overflow-y-auto pr-1">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setSelectedTime(slot);
                      commit(selectedDate, slot, false);
                    }}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors",
                      selectedTime === slot ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">取消</button>
            <button type="button" onClick={() => { commit(selectedDate, selectedTime, true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground transition-colors hover:bg-primary/90">
              <Check className="size-3.5" /> 应用
            </button>
          </div>
        </div>
      )}
    </label>
  );
}
