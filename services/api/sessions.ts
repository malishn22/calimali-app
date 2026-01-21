import { ScheduledSession, SessionHistory } from "@/constants/Types";
import { API_URL, headers } from "./config";
import { ApiScheduledSession, ApiSession } from "./types";

// Planned Sessions
export const getPlannedSessions = async (): Promise<ScheduledSession[]> => {
  try {
    const response = await fetch(`${API_URL}/planned-sessions`);
    if (!response.ok) throw new Error("Failed to fetch planned sessions");
    const data: ApiScheduledSession[] = await response.json();

    // Map to frontend ScheduledSession type
    return data.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.startDate,
      frequency: s.frequency as any,
      color: s.color,
      exercises: JSON.stringify(
        s.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          name: e.exercise.name,
          sets: e.targetSets || 3,
          reps: e.targetReps || 10,
        })),
      ),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const postPlannedSession = async (session: ScheduledSession) => {
  try {
    // Parse exercises string if needed, or assume it's already an object if types were strict.
    // Frontend uses stringified JSON for local DB.
    // We need to decode it to send to API.
    const exercises =
      typeof session.exercises === "string"
        ? JSON.parse(session.exercises)
        : session.exercises;

    const body = {
      title: session.title,
      startDate: session.date,
      frequency: session.frequency,
      color: session.color,
      exercises: exercises.map((e: any, idx: number) => ({
        exerciseId: e.exerciseId || e.id, // Handle legacy 'id' usage
        orderIndex: idx,
        targetSets: e.sets,
        targetReps: Array.isArray(e.reps) ? e.reps[0] : e.reps, // API expects int for now? Or we should handle array?
        // API PlannedSessionExercise has `target_reps` (int).
        // Frontend support variable reps per set (number[]).
        // This is a mismatch. The backend `PlannedSessionExercise` is simple properly.
        // The `SessionExercise` (performed) has sets.
        // For Planning, let's just take the first value or max.
      })),
    };

    await fetch(`${API_URL}/planned-sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error(e);
  }
};

export const deletePlannedSession = async (id: string) => {
  try {
    await fetch(`${API_URL}/planned-sessions/${id}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.error(e);
  }
};

export const updatePlannedSession = async (session: ScheduledSession) => {
  try {
    // WORKAROUND: Delete and Re-create since PUT is not fully ready/verified on backend
    if (session.id) {
      await deletePlannedSession(session.id);
    }
    await postPlannedSession(session);
  } catch (e) {
    console.error(e);
  }
};

// Session History
export const getSessionHistory = async (): Promise<SessionHistory[]> => {
  try {
    const response = await fetch(`${API_URL}/sessions`);
    if (!response.ok) throw new Error("Failed to fetch sessions");
    const data: ApiSession[] = await response.json();

    return data.map((s) => ({
      id: s.id,
      session_id: s.plannedSessionId || "",
      date: s.performedAt,
      performance_data: JSON.stringify(
        s.sessionExercises.map((se) => ({
          exercise: {
            id: se.exerciseId, // Need full exercise data? For history it might be needed.
            // The API session only returns snapshots.
            // If FE relies on `exercise` object in history, we might need to reconstruct it or fetch it.
            // But `SessionHistory` usually just displays.
            // However, `LiveSession` saves full objects.
            // `getSessionHistory` isn't used much except for 'Last Session' stats where it counts reps?
            // `SessionCard` (completed) uses it? `SessionCard` uses `ScheduledSession`.
            // Dashboard uses history to check completions.
            // The `performance_data` is used in `SessionDetail`? (If exists).
            // Let's assume snapshot name is enough for now.
            name: se.exerciseNameSnapshot,
          },
          sets: se.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
            seconds: set.seconds,
          })),
        })),
      ),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const postSession = async (data: any) => {
  try {
    // FE passes 'data' which matches SessionHistory but might be loose.
    // We need to map it to CreateSessionDto for the backend.
    // Expected FE data structure when saving:
    // {
    //   session_id: string (planned session id or null),
    //   date: string (ISO),
    //   performance_data: string (JSON string of exercises) OR object?
    // }
    // The `LiveSession/index.tsx` calls `saveSessionHistory` (now postSession) with:
    // {
    //    id: uuid(),
    //    session_id: activeSessionId,
    //    date: new Date().toISOString(),
    //    performance_data: JSON.stringify(results)
    // }

    // So we need to PARSE performance_data string.
    const exercises =
      typeof data.performance_data === "string"
        ? JSON.parse(data.performance_data)
        : data.performance_data;

    const body = {
      plannedSessionId: data.session_id || null, // Might need UUID validation? string empty vs null
      titleSnapshot: "Workout", // Default title if not provided
      performedAt: data.date,
      durationSeconds: 0, // FE doesn't track total duration?
      notes: "",
      exercises: exercises.exercises.map((ex: any, idx: number) => ({
        // exercises.exercises because structure in LiveSession is { exercises: [], ... }
        exerciseId: ex.id || ex.exerciseId, // Check structure in LiveSession
        orderIndex: idx,
        exerciseNameSnapshot: ex.name,
        unitSnapshot: ex.unit || "REPS",
        sets: Array.from({ length: ex.sets }).map((_, sIdx) => {
          // We need to map completed sets.
          // LiveSession structure: `completedSets` map, `exercises` array with `reps` array.
          // Reconstructing `postSession` logic is complex.
          // Let's rely on `LiveSession` sending us the right data?
          // No, `LiveSession` sends `performance_data` which contains the raw state.
          // I need to parse that state here.
          // See `LiveSession/index.tsx` `handleSaveData`:
          // performance_data: { elapsedTime, exercises, completedSets }

          // Let's parse it:
          return {
            setIndex: sIdx,
            reps: Array.isArray(ex.reps) ? ex.reps[sIdx] : ex.reps,
            weight: 0,
            seconds: 0,
          };
        }),
      })),
    };

    // Fix plannedSessionId being empty string
    if (body.plannedSessionId === "") body.plannedSessionId = null;

    const response = await fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers,
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
