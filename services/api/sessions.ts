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
          name: e.exercise?.name || "Unknown Exercise",
          description: e.exercise?.description,
          categorySlug: e.exercise?.category?.slug,
          muscleGroups: e.exercise?.exerciseMuscleGroups?.map((mg: any) => ({
            muscleDescription: mg.muscleGroup?.code,
            impact: mg.impact as any,
            effect: mg.effect as any,
          })),
          is_unilateral: e.exercise?.isUnilateral,
          sets:
            e.sets && e.sets.length > 0
              ? e.exercise?.isUnilateral
                ? Math.ceil(e.sets.length / 2)
                : e.sets.length
              : e.targetSets || 3,
          reps:
            e.sets && e.sets.length > 0
              ? e.sets.sort((a, b) => a.setIndex - b.setIndex).map((s) => s.targetReps || 0)
              : e.targetReps || 10,
        })),
      ),
    }));
  } catch (error) {
    // console.warn("getPlannedSessions failed, returning empty list.");
    return [];
  }
};

export const postPlannedSession = async (session: ScheduledSession) => {
  // Parse exercises string if needed, or assume it's already an object if types were strict.
  // Frontend uses stringified JSON for local DB.
  // We need to decode it to send to API.
  const exercises =
    typeof session.exercises === "string"
      ? JSON.parse(session.exercises)
      : session.exercises;

  const body = {
    title: session.title,
    // Fix: Convert to Local YYYY-MM-DD to avoid UTC timezone shift (e.g. 21:00 Z previous day)
    startDate: (() => {
      const d = new Date(session.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })(),
    frequency: session.frequency,
    color: session.color,
    exercises: exercises.map((e: any, idx: number) => ({
      exerciseId: e.exerciseId || e.id, // Handle legacy 'id' usage
      orderIndex: idx,
      targetSets: e.sets,
      targetReps: Array.isArray(e.reps) ? e.reps[0] : e.reps, // Legacy support
      sets: Array.isArray(e.reps)
        ? e.reps.map((r: number, i: number) => ({
            setIndex: i,
            targetReps: r,
            targetSeconds: 0,
            restSeconds: 0,
          }))
        : Array.from({ length: e.sets || 1 }).map((_, i) => ({
            setIndex: i,
            targetReps: e.reps,
            targetSeconds: 0,
            restSeconds: 0,
          })),
    })),
  };

  const response = await fetch(`${API_URL}/planned-sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to post session: ${response.status} ${text}`);
  }
};

export const deletePlannedSession = async (id: string) => {
  const response = await fetch(`${API_URL}/planned-sessions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete planned session");
  }
};

export const updatePlannedSession = async (session: ScheduledSession) => {
  // WORKAROUND: Delete and Re-create since PUT is not fully ready/verified on backend
  if (session.id) {
    // We try to delete, but if it fails (e.g. 404), we proceed to post
    try {
      await deletePlannedSession(session.id);
    } catch (e) {
      console.warn("Update: Delete failed, proceeding to create", e);
    }
  }
  await postPlannedSession(session);
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
      performance_data: JSON.stringify({
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
    // console.warn("getSessionHistory failed, returning empty list.");
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
    const parsedData =
      typeof data.performance_data === "string"
        ? JSON.parse(data.performance_data)
        : data.performance_data;

    const body = {
      plannedSessionId: data.session_id || null, // Might need UUID validation? string empty vs null
      titleSnapshot: "Workout", // Default title if not provided
      performedAt: data.date,
      durationSeconds: parsedData.elapsedTime || 0, // Get actual duration from parsed data
      notes: "",
      exercises: parsedData.exercises.map((ex: any, idx: number) => ({
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
