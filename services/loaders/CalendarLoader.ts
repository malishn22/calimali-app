import Colors from "@/constants/Colors";
import { getSessions, ScheduledSession } from "@/services/Database";

export interface CalendarData {
  sessions: ScheduledSession[];
  markedDates: Record<string, any>;
}

export class CalendarLoader {
  static async load(): Promise<CalendarData> {
    // 1. Fetch Sessions from DB
    const sessions = await getSessions();

    // 2. Pre-calculate markedDates (Dots)
    // This calculation is heavy, so we do it here on the "conveyor belt"
    const markedDates = sessions.reduce(
      (acc, session) => {
        const d = new Date(session.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        if (!acc[dateStr]) {
          acc[dateStr] = { dots: [] };
        }

        // Add dot for this session
        acc[dateStr].dots.push({
          color: session.color || Colors.palette.blue500,
          key: session.id,
        });

        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      sessions,
      markedDates,
    };
  }
}
