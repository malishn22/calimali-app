import { PlannedSession, SessionHistory } from "@/constants/Types";
import { apiFetch } from "./config";
import { ApiPlannedSession, ApiSession } from "./types";

// --- Weekday bitmask <-> array ---------------------------------------------------
// The wire format is an int bitmask (bit 0 = Sunday, matching Date#getDay), which keeps
// the column indexable. The domain type is an array, so nothing above this layer has to
// think in bits.

const DAY_BITS = [0, 1, 2, 3, 4, 5, 6];

const maskToDays = (mask: number): number[] =>
  DAY_BITS.filter((bit) => (mask >> bit) & 1);

const daysToMask = (days: number[]): number =>
  days.reduce((mask, day) => mask | (1 << day), 0);

// --- Planned sessions (calendar placements) --------------------------------------

const fromApi = (p: ApiPlannedSession): PlannedSession => ({
  id: p.id,
  routineId: p.routineId,
  startDate: p.startDate,
  endDate: p.endDate ?? null,
  recurrenceType: p.recurrenceType as PlannedSession["recurrenceType"],
  daysOfWeek: maskToDays(p.daysOfWeek),
  intervalDays: p.intervalDays ?? null,
});

const toRequestBody = (plan: Omit<PlannedSession, "id">) => ({
  routineId: plan.routineId,
  startDate: plan.startDate,
  endDate: plan.endDate ?? null,
  recurrenceType: plan.recurrenceType,
  daysOfWeek: daysToMask(plan.daysOfWeek),
  intervalDays: plan.intervalDays ?? null,
});

export const getPlannedSessions = async (): Promise<PlannedSession[]> => {
  try {
    const response = await apiFetch("/planned-sessions");
    if (!response.ok) throw new Error("Failed to fetch planned sessions");
    const data: ApiPlannedSession[] = await response.json();
    return data.map(fromApi);
  } catch (error) {
    return [];
  }
};

export const createPlannedSession = async (
  plan: Omit<PlannedSession, "id">,
): Promise<PlannedSession> => {
  const response = await apiFetch("/planned-sessions", {
    method: "POST",
    body: JSON.stringify(toRequestBody(plan)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create planned session: ${response.status} ${text}`);
  }

  return fromApi(await response.json());
};

export const updatePlannedSession = async (
  plan: PlannedSession,
): Promise<PlannedSession> => {
  const response = await apiFetch(`/planned-sessions/${plan.id}`, {
    method: "PUT",
    body: JSON.stringify(toRequestBody(plan)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update planned session: ${response.status} ${text}`);
  }

  return fromApi(await response.json());
};

export const deletePlannedSession = async (id: string) => {
  const response = await apiFetch(`/planned-sessions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete planned session");
  }
};

// --- Session history -------------------------------------------------------------

export const getSessionHistory = async (): Promise<SessionHistory[]> => {
  try {
    const response = await apiFetch("/sessions");
    if (!response.ok) throw new Error("Failed to fetch sessions");
    const data: ApiSession[] = await response.json();

    return data.map((s) => ({
      id: s.id,
      routineId: s.routineId || "",
      title: s.titleSnapshot,
      date: s.performedAt,
      performanceData: JSON.stringify({
        // Reconstruct expected frontend object for History
        elapsedTime: s.durationSeconds || 0,
        exercises: s.sessionExercises.map((se) => ({
          exerciseId: se.exerciseId,
          name: se.exerciseNameSnapshot,
          sets: se.sets.length,
          reps: se.sets.map((set) => set.reps || 0),
        })),
      }),
    }));
  } catch (error) {
    return [];
  }
};

export interface PostSessionInput {
  /** Routine this workout came from; omit for an ad-hoc session. */
  routineId?: string | null;
  /** Routine name at the time of the workout, snapshotted into history. */
  title?: string;
  date: string;
  performanceData: string;
}

export const postSession = async (data: PostSessionInput) => {
  try {
    const parsedData =
      typeof data.performanceData === "string"
        ? JSON.parse(data.performanceData)
        : data.performanceData;

    const body = {
      routineId: data.routineId || null,
      titleSnapshot: data.title?.trim() || "Workout",
      performedAt: data.date,
      durationSeconds: parsedData.elapsedTime || 0,
      notes: "",
      exercises: parsedData.exercises.map((ex: any, idx: number) => ({
        exerciseId: ex.id || ex.exerciseId,
        orderIndex: idx,
        exerciseNameSnapshot: ex.name,
        unitSnapshot: ex.unit || "REPS",
        sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
          setIndex: sIdx,
          reps: Array.isArray(ex.reps) ? ex.reps[sIdx] : ex.reps,
          weight: 0,
          seconds: 0,
        })),
      })),
    };

    const response = await apiFetch("/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error("Failed to post session: " + err);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
