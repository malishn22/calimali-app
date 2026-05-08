// Mock activities — prepared for future frontend use (no service file yet)

export interface MockActivity {
  id: string;
  performedAt: string;
  type: string;
  durationSeconds: number | null;
  distanceMeters: number | null;
  steps: number | null;
  notes: string | null;
  source: string;
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const INITIAL_ACTIVITIES: MockActivity[] = [
  { id: "act-001", performedAt: daysAgoISO(2), type: "WALK", durationSeconds: 1800, distanceMeters: 2500, steps: 3200, notes: null, source: "MANUAL" },
  { id: "act-002", performedAt: daysAgoISO(5), type: "RUN", durationSeconds: 2400, distanceMeters: 5000, steps: 5500, notes: "Morning jog", source: "MANUAL" },
  { id: "act-003", performedAt: daysAgoISO(9), type: "WALK", durationSeconds: 2700, distanceMeters: 3500, steps: 4200, notes: null, source: "MANUAL" },
  { id: "act-004", performedAt: daysAgoISO(14), type: "RUN", durationSeconds: 1800, distanceMeters: 3800, steps: 4000, notes: null, source: "MANUAL" },
  { id: "act-005", performedAt: daysAgoISO(20), type: "WALK", durationSeconds: 3600, distanceMeters: 5000, steps: 6200, notes: "Long walk", source: "MANUAL" },
  { id: "act-006", performedAt: daysAgoISO(27), type: "RUN", durationSeconds: 2100, distanceMeters: 4200, steps: 4600, notes: null, source: "MANUAL" },
];

import { createMockStore } from "./utils";

export const mockActivityStore = createMockStore(INITIAL_ACTIVITIES);
