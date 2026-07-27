import Colors from "@/constants/Colors";
import { PlannedSession, Routine, ScheduledEntry } from "@/constants/Types";
import { occursOn, toDateOnly } from "@/utilities/recurrence";
import { Api } from "../api";

export interface CalendarData {
  /** Every saved routine, for the picker sheet and the Routines tab. */
  routines: Routine[];
  /** Every calendar placement. */
  plannedSessions: PlannedSession[];
  /** Placements already resolved against their routine, ready to render. */
  entries: ScheduledEntry[];
  markedDates: Record<string, any>;
}

export class CalendarLoader {
  static async load(): Promise<CalendarData> {
    // Routines and placements are fetched separately and joined here rather than having
    // the API nest the routine inside every placement: the routine list is needed on its
    // own anyway, and nesting would repeat a full routine payload per recurring schedule.
    const [routines, plannedSessions] = await Promise.all([
      Api.getRoutines(),
      Api.getPlannedSessions(),
    ]);

    const routinesById = new Map(routines.map((r) => [r.id, r]));

    // A placement whose routine is missing (deleted mid-flight) is dropped rather than
    // rendered as a blank row.
    const entries: ScheduledEntry[] = plannedSessions.flatMap((plannedSession) => {
      const routine = routinesById.get(plannedSession.routineId);
      return routine ? [{ plannedSession, routine }] : [];
    });

    // Pre-calculate markedDates (dots) for 6 months back to 12 months forward.
    const markedDates: Record<string, any> = {};

    const TODAY = new Date();
    // setDate(1) first: on the 31st, shifting the month before clamping the day
    // overflows into the following month (Aug 31 minus 6 lands in March, not February).
    const START_DATE = new Date(TODAY);
    START_DATE.setDate(1);
    START_DATE.setMonth(START_DATE.getMonth() - 6);

    const END_DATE = new Date(TODAY);
    END_DATE.setDate(1);
    END_DATE.setMonth(END_DATE.getMonth() + 13);
    END_DATE.setDate(0); // last day of the previous month

    const currentDate = new Date(START_DATE);

    while (currentDate <= END_DATE) {
      const active = entries.filter((e) =>
        occursOn(e.plannedSession, currentDate),
      );

      if (active.length > 0) {
        markedDates[toDateOnly(currentDate)] = {
          dots: active.map((e) => ({
            color: e.routine.color || Colors.palette.electricBlue,
            key: e.plannedSession.id,
          })),
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { routines, plannedSessions, entries, markedDates };
  }
}
