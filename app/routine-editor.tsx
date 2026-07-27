import RoutineEditor from "@/components/routines/RoutineEditor";
import { Routine } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

/**
 * Create or edit a routine. Reached only from the Routines tab — pass `routineId` to
 * edit an existing one, or no params to create a new one. Scheduling happens elsewhere.
 */
export default function RoutineEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { routines, refreshSessions } = useCalendarContext();

  const routineId =
    typeof params.routineId === "string" ? params.routineId : null;

  // Read from the cache rather than a serialized param: the list is already loaded, and
  // it avoids a second copy of the routine going stale in the URL.
  const initialRoutine: Routine | null = routineId
    ? routines.find((r) => r.id === routineId) ?? null
    : null;

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    await refreshSessions();
    router.back();
  };

  return (
    <RoutineEditor
      onClose={handleClose}
      onSave={handleSave}
      initialRoutine={initialRoutine}
    />
  );
}
