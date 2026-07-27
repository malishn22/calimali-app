import { Routine, ScheduledEntry } from "@/constants/Types";
import React, { createContext, useContext, useState } from "react";
import { useCache } from "./CacheContext";

interface CalendarContextType {
  // Data (Read from Cache)
  /** Placements resolved against their routine. */
  entries: ScheduledEntry[];
  /** Every saved routine, whether scheduled or not. */
  routines: Routine[];
  markedDates: Record<string, any>;

  // View State
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Actions
  /** Re-reads routines and placements together. */
  refreshSessions: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider (Wrapper)",
    );
  }
  return context;
}

export function CalendarContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { calendarData, refreshCalendar } = useCache();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!calendarData) {
    // Unauthenticated / pre-load: render children (e.g. the login screen) without
    // the calendar context. Authed screens only mount once calendarData exists.
    return <>{children}</>;
  }

  return (
    <CalendarContext.Provider
      value={{
        entries: calendarData.entries,
        routines: calendarData.routines,
        markedDates: calendarData.markedDates,
        selectedDate,
        setSelectedDate,
        refreshSessions: refreshCalendar,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}
