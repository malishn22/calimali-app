import Colors from "@/constants/Colors";
import {
  getSessions,
  isSessionActiveOnDate,
  ScheduledSession,
} from "@/services/Database";

export interface CalendarData {
  sessions: ScheduledSession[];
  markedDates: Record<string, any>;
}

export class CalendarLoader {
  static async load(): Promise<CalendarData> {
    // 1. Fetch Sessions from DB
    const sessions = await getSessions();

    // 2. Pre-calculate markedDates (Dots)
    // We will generate markers for a range: 6 months back, 12 months forward
    const markedDates: Record<string, any> = {};

    const TODAY = new Date();
    const START_DATE = new Date(TODAY);
    START_DATE.setMonth(START_DATE.getMonth() - 6);
    START_DATE.setDate(1); // Start of that month

    const END_DATE = new Date(TODAY);
    END_DATE.setMonth(END_DATE.getMonth() + 12);
    END_DATE.setDate(0); // End of that month

    // Helper loop
    const currentDate = new Date(START_DATE);

    // Performance: Optimize if too slow (it shouldn't be for ~550 days * N sessions)
    while (currentDate <= END_DATE) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Check each session
      const activeSessions = sessions.filter((s) =>
        isSessionActiveOnDate(s, currentDate),
      );

      if (activeSessions.length > 0) {
        markedDates[dateStr] = {
          dots: activeSessions.map((s) => ({
            color: s.color || Colors.palette.blue500,
            key: s.id,
          })),
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      sessions,
      markedDates,
    };
  }
}
