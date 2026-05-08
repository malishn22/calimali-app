// Mock body weight entries — prepared for future frontend use (no service file yet)

export interface MockBodyWeightEntry {
  id: string;
  measuredAt: string; // YYYY-MM-DD
  weightKg: number;
  notes: string | null;
}

function daysAgoDate(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const INITIAL_BODY_WEIGHT: MockBodyWeightEntry[] = [
  { id: "bw-001", measuredAt: daysAgoDate(0), weightKg: 79.2, notes: null },
  { id: "bw-002", measuredAt: daysAgoDate(7), weightKg: 79.5, notes: null },
  { id: "bw-003", measuredAt: daysAgoDate(14), weightKg: 79.8, notes: null },
  { id: "bw-004", measuredAt: daysAgoDate(21), weightKg: 80.1, notes: "After holiday" },
  { id: "bw-005", measuredAt: daysAgoDate(28), weightKg: 80.4, notes: null },
  { id: "bw-006", measuredAt: daysAgoDate(35), weightKg: 80.9, notes: null },
  { id: "bw-007", measuredAt: daysAgoDate(42), weightKg: 81.2, notes: null },
  { id: "bw-008", measuredAt: daysAgoDate(49), weightKg: 81.6, notes: null },
  { id: "bw-009", measuredAt: daysAgoDate(56), weightKg: 82.0, notes: "Starting point" },
];

import { createMockStore } from "./utils";

export const mockBodyWeightStore = createMockStore(INITIAL_BODY_WEIGHT);
