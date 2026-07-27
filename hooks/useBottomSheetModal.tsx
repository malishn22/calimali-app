import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BOTTOM_SHEET_OFFSET } from "@/constants/Layout";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

const SNAP_POINTS = ["85%"] as const;

/** Shared background style for detail bottom sheets. */
export const BOTTOM_SHEET_BACKGROUND_STYLE = { backgroundColor: "#1c1c1e" as const };

export interface UseBottomSheetModalOptions {
  /** Backdrop opacity (default 0.6). */
  backdropOpacity?: number;
  /** Override the sheet height (default `["85%"]`). */
  snapPoints?: string[];
}

/**
 * Shared logic for present/dismiss bottom sheet modals (ExerciseDetailSheet,
 * RoutinePickerSheet). Returns ref, snapPoints, handleSheetChanges, renderBackdrop, and
 * common props for BottomSheetModal.
 */
export function useBottomSheetModal(
  visible: boolean,
  hasData: boolean,
  onClose: () => void,
  options: UseBottomSheetModalOptions = {}
) {
  const { backdropOpacity = 0.6, snapPoints: snapPointsOption } = options;
  const ref = useRef<BottomSheetModal>(null);
  const snapPointsKey = snapPointsOption?.join(",");
  const snapPoints = useMemo(
    () => snapPointsOption ?? [...SNAP_POINTS],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapPointsKey],
  );

  // Whether the sheet is actually up. Dismissing one that was never presented is not a
  // harmless no-op: gorhom's handleDismiss doesn't early-exit from the INITIAL status, so
  // it parks the modal at DISMISSING and calls forceClose on an inner sheet that isn't
  // mounted. Nothing can move the status off DISMISSING after that (only onChange and
  // onAnimate do, and neither can fire), and the portal refuses to render in that state —
  // so every later present() draws nothing at all.
  const presentedRef = useRef(false);

  useEffect(() => {
    if (visible && hasData) {
      presentedRef.current = true;
      ref.current?.present();
    } else if (presentedRef.current) {
      ref.current?.dismiss();
    }
  }, [visible, hasData]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // Cleared before onClose flips `visible`, so the effect above doesn't follow a
        // self-close (pan-down, backdrop tap) with a redundant dismiss — which would
        // poison the modal exactly as described above and kill the *second* open.
        presentedRef.current = false;
        onClose();
      }
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
