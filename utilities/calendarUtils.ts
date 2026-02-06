/**
 * Pure calendar helpers - no dependencies on flash-calendar or hooks.
 */

export function toDateId(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns Monday of the week containing `date` (week starts Monday). */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export interface DayCell {
  id: string;
  date: Date;
  displayLabel: string;
  isDifferentMonth: boolean;
}

/** Returns 7 dates for the week starting at `mondayOfWeek`. */
export function getWeekDates(mondayOfWeek: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(mondayOfWeek);
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/** Returns 6 weeks of 7 days each for the given month. Days from adjacent months have isDifferentMonth=true. */
export function getMonthWeeks(year: number, month: number): DayCell[][] {
  const first = new Date(year, month, 1);
  const startMonday = getMonday(first);
  const weeks: DayCell[][] = [];
  let current = new Date(startMonday);

  for (let w = 0; w < 6; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(current);
      week.push({
        id: toDateId(cellDate),
        date: cellDate,
        displayLabel: String(cellDate.getDate()),
        isDifferentMonth: cellDate.getMonth() !== month,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Get month label for display (e.g. "February 2025"). */
export function getMonthLabel(year: number, month: number, locale = "en"): string {
  return new Date(year, month, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

/** Get week label for display (e.g. "Feb 3 – Feb 9"). */
export function getWeekLabel(mondayOfWeek: Date, locale = "en"): string {
  const mon = new Date(mondayOfWeek);
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}
