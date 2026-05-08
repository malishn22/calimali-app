import { ScheduledSession, SessionHistory } from "@/constants/Types";
import { createMockStore } from "./utils";

// Helper to get a date string N days ago
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// --- Planned Sessions ---

const INITIAL_PLANNED_SESSIONS: ScheduledSession[] = [
  {
    id: "ps-mock-001",
    title: "Upper Body Push",
    date: daysAgo(3),
    frequency: "WEEKLY",
    color: "#4F46E5",
    exercises: JSON.stringify([
      { exerciseId: "08786b83-a7d0-45c1-81c7-e394b89dac5d", name: "Bench Dip", sets: 3, reps: 12, categorySlug: "push" },
      { exerciseId: "5dd40e1f-7d5c-487d-8df8-5dac013c1c38", name: "Pull Up", sets: 3, reps: 8, categorySlug: "pull" },
      { exerciseId: "29b2c516-0da9-4a73-8a41-638c0dbd8e57", name: "Crunch", sets: 3, reps: 15, categorySlug: "core" },
    ]),
  },
  {
    id: "ps-mock-002",
    title: "Leg Day",
    date: daysAgo(1),
    frequency: "ONCE",
    color: "#DC2626",
    exercises: JSON.stringify([
      { exerciseId: "afd61fbb-40ec-493b-81c6-3ea33dd9b72e", name: "Skater Jump", sets: 3, reps: 20, categorySlug: "cardio" },
      { exerciseId: "54391b6b-252f-4c5c-8c5e-1d1f2176acbb", name: "Alternating Leg Raises", sets: 3, reps: 12, categorySlug: "core" },
    ]),
  },
];

// --- Session History ---

const INITIAL_SESSION_HISTORY: SessionHistory[] = [
  {
    id: "sh-mock-001",
    session_id: "ps-mock-001",
    date: daysAgoISO(14),
    performance_data: JSON.stringify({
      elapsedTime: 2400,
      exercises: [
        { exerciseId: "08786b83-a7d0-45c1-81c7-e394b89dac5d", name: "Bench Dip", sets: 3, reps: [12, 10, 10] },
        { exerciseId: "5dd40e1f-7d5c-487d-8df8-5dac013c1c38", name: "Pull Up", sets: 3, reps: [8, 7, 6] },
        { exerciseId: "29b2c516-0da9-4a73-8a41-638c0dbd8e57", name: "Crunch", sets: 3, reps: [15, 15, 12] },
      ],
    }),
  },
  {
    id: "sh-mock-002",
    session_id: "ps-mock-001",
    date: daysAgoISO(7),
    performance_data: JSON.stringify({
      elapsedTime: 2200,
      exercises: [
        { exerciseId: "08786b83-a7d0-45c1-81c7-e394b89dac5d", name: "Bench Dip", sets: 3, reps: [12, 12, 10] },
        { exerciseId: "5dd40e1f-7d5c-487d-8df8-5dac013c1c38", name: "Pull Up", sets: 3, reps: [8, 8, 7] },
        { exerciseId: "29b2c516-0da9-4a73-8a41-638c0dbd8e57", name: "Crunch", sets: 3, reps: [15, 15, 15] },
      ],
    }),
  },
  {
    id: "sh-mock-003",
    session_id: "ps-mock-002",
    date: daysAgoISO(5),
    performance_data: JSON.stringify({
      elapsedTime: 1800,
      exercises: [
        { exerciseId: "afd61fbb-40ec-493b-81c6-3ea33dd9b72e", name: "Skater Jump", sets: 3, reps: [20, 18, 16] },
        { exerciseId: "54391b6b-252f-4c5c-8c5e-1d1f2176acbb", name: "Alternating Leg Raises", sets: 3, reps: [12, 12, 10] },
      ],
    }),
  },
  {
    id: "sh-mock-004",
    session_id: "ps-mock-001",
    date: daysAgoISO(2),
    performance_data: JSON.stringify({
      elapsedTime: 2500,
      exercises: [
        { exerciseId: "08786b83-a7d0-45c1-81c7-e394b89dac5d", name: "Bench Dip", sets: 3, reps: [12, 12, 12] },
        { exerciseId: "5dd40e1f-7d5c-487d-8df8-5dac013c1c38", name: "Pull Up", sets: 3, reps: [9, 8, 7] },
        { exerciseId: "29b2c516-0da9-4a73-8a41-638c0dbd8e57", name: "Crunch", sets: 3, reps: [15, 15, 15] },
      ],
    }),
  },
];

export const mockPlannedSessionStore = createMockStore(INITIAL_PLANNED_SESSIONS);
export const mockSessionHistoryStore = createMockStore(INITIAL_SESSION_HISTORY);
