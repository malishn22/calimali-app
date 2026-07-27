import { RecurrenceType } from "@/constants/Enums";
import { PlannedSession } from "@/constants/Types";

/**
 * Weekdays in display order (Monday first), holding `Date#getDay()` values. The bitmask
 * on the wire is getDay-indexed (Sunday = bit 0) while the whole calendar UI is
 * Monday-first, so every chip row and label must iterate through this constant rather
 * than 0..6 — that mismatch is the natural home for an off-by-one.
 */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

/** Long labels, indexed by `getDay()`. */
export const DAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/** Single-letter labels for compact chips, indexed by `getDay()`. */
export const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/**
 * Parses a `YYYY-MM-DD` string as **local** midnight.
 *
 * `new Date("2026-07-28")` parses as UTC midnight, which at any negative UTC offset is
 * the previous civil day locally — every schedule would fire a day early, and reading
 * the parts back out to re-save would walk the date backwards one day per edit.
 */
export const parseDateOnly = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Formats a Date as the local `YYYY-MM-DD` the API expects. */
export const toDateOnly = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Integer civil-day index for a date, ignoring time and time zone.
 *
 * Built from the *local* Y/M/D via `Date.UTC`, so day arithmetic is immune to DST —
 * unlike dividing an elapsed-millisecond delta by 86_400_000, which drifts on the 23-
 * and 25-hour days.
 */
export const epochDay = (date: Date): number =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );

/** Whether a planned session produces an occurrence on the given day. */
export const occursOn = (plan: PlannedSession, date: Date): boolean => {
  const target = epochDay(date);
  const start = epochDay(parseDateOnly(plan.startDate));

  if (target < start) return false;
  if (plan.endDate && target > epochDay(parseDateOnly(plan.endDate))) {
    return false;
  }

  switch (plan.recurrenceType) {
    case RecurrenceType.ONCE:
      return target === start;
    // The weekday set is authoritative — unlike the old model, the start date's own
    // weekday carries no special meaning here.
    case RecurrenceType.WEEKLY:
      return plan.daysOfWeek.includes(date.getDay());
    case RecurrenceType.INTERVAL: {
      const step = plan.intervalDays ?? 0;
      if (step < 1) return false; // guard: a 0 step would divide by zero
      return (target - start) % step === 0;
    }
    default:
      return false; // unknown type from a newer backend: show nothing rather than guess
  }
};

/** Human-readable summary of a recurrence rule, e.g. "Mon, Thu" or "Every 3 days". */
export const formatRecurrence = (plan: PlannedSession): string => {
  switch (plan.recurrenceType) {
    case RecurrenceType.ONCE:
      return "Once";
    case RecurrenceType.WEEKLY: {
      const days = new Set(plan.daysOfWeek);
      if (days.size === 0) return "No days selected";
      if (days.size === 7) return "Every day";
      if (days.size === 5 && [1, 2, 3, 4, 5].every((d) => days.has(d))) {
        return "Weekdays";
      }
      if (days.size === 2 && days.has(0) && days.has(6)) return "Weekends";
      return WEEK_ORDER.filter((d) => days.has(d))
        .map((d) => DAY_LABELS[d])
        .join(", ");
    }
    case RecurrenceType.INTERVAL:
      return plan.intervalDays === 1
        ? "Every day"
        : `Every ${plan.intervalDays} days`;
    default:
      return "";
  }
};
