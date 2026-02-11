import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BOTTOM_SHEET_OFFSET } from "@/constants/Layout";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

const SNAP_POINTS = ["85%"] as const;

/** Shared background style for detail bottom sheets. */
export const BOTTOM_SHEET_BACKGROUND_STYLE = { backgroundColor: "#1c1c1e" as const };

export interface UseBottomSheetModalOptions {
  /** Backdrop opacity (default 0.6). */
  backdropOpacity?: number;
}

/**
 * Shared logic for present/dismiss bottom sheet modals (e.g. ExerciseDetailSheet, SessionDetailSheet).
 * Returns ref, snapPoints, handleSheetChanges, renderBackdrop, and common props for BottomSheetModal.
 */
export function useBottomSheetModal(
  visible: boolean,
  hasData: boolean,
  onClose: () => void,
  options: UseBottomSheetModalOptions = {}
) {
  const { backdropOpacity = 0.6 } = options;
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [...SNAP_POINTS], []);

  useEffect(() => {
    if (visible && hasData) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible, hasData]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={backdropOpacity}
      />
    ),
    [backdropOpacity]
  );

  const commonProps = useMemo(
    () => ({
      backgroundStyle: BOTTOM_SHEET_BACKGROUND_STYLE,
      bottomInset: BOTTOM_SHEET_OFFSET,
    }),
    []
  );

  return {
    ref,
    snapPoints,
    handleSheetChanges,
    renderBackdrop,
    commonProps,
  };
}
