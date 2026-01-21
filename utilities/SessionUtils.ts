import { ScheduledSession } from "@/constants/Types";

// Helper to check frequencies
export const isSessionActiveOnDate = (
  session: ScheduledSession,
  date: Date,
): boolean => {
  const sessionDate = new Date(session.date);
  // Normalize comparison to local date (strip time)
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const start = new Date(sessionDate);
  start.setHours(0, 0, 0, 0);

  if (target < start) return false;

  if (session.frequency === "ONCE") {
    return target.getTime() === start.getTime();
  } else if (session.frequency === "DAILY") {
    return true; // Already verified date >= start
  } else if (session.frequency === "WEEKLY") {
    return target.getDay() === start.getDay();
  } else if (session.frequency === "EVERY 2 DAYS") {
    const diffTime = Math.abs(target.getTime() - start.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 2 === 0;
  }
  return false;
};
