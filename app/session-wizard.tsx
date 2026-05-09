import SessionWizard from "@/components/sessions/SessionWizard";
import { ScheduledSession } from "@/constants/Types";
import { useCalendarContext } from "@/context/CalendarContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function SessionWizardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshSessions } = useCalendarContext();

  let selectedDate = new Date();
  if (typeof params.selectedDate === "string") {
    selectedDate = new Date(params.selectedDate);
  }

  let initialSession: ScheduledSession | null = null;
  try {
    if (typeof params.initialSession === "string") {
      initialSession = JSON.parse(params.initialSession);
    }
  } catch (e) {
    console.error("Failed to parse initialSession param", e);
  }

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    await refreshSessions();
    router.back();
  };

  return (
    <SessionWizard
      onClose={handleClose}
      onSave={handleSave}
      selectedDate={selectedDate}
      initialSession={initialSession}
    />
  );
}
