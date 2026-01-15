import Colors, { SessionColors } from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface EditSetModalProps {
  visible: boolean;
  initialReps: number;
  onClose: () => void;
  onSave: (newReps: number) => void;
  onDelete: () => void;
}

export default function EditSetModal({
  visible,
  initialReps,
  onClose,
  onSave,
  onDelete,
}: EditSetModalProps) {
  const [reps, setReps] = useState(initialReps);

  useEffect(() => {
    if (visible) {
      setReps(initialReps);
    }
  }, [visible, initialReps]);

  const updateReps = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Set</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <FontAwesome
                name="close"
                size={16}
                color={Colors.palette.zinc400}
              />
            </Pressable>
          </View>

          {/* Counter */}
          <View style={styles.counterRow}>
            <Pressable style={styles.counterBtn} onPress={() => updateReps(-1)}>
              <FontAwesome
                name="minus"
                size={16}
                color={Colors.palette.zinc400}
              />
            </Pressable>
            <Text style={styles.counterValue}>{reps}</Text>
            <Pressable style={styles.counterBtn} onPress={() => updateReps(1)}>
              <FontAwesome name="plus" size={16} color={Colors.palette.white} />
            </Pressable>
          </View>

          {/* Actions */}
          <Pressable style={styles.saveBtn} onPress={() => onSave(reps)}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={onDelete}>
            <FontAwesome
              name="trash"
              size={14}
              color={Colors.palette.red500}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.deleteBtnText}>Delete Set</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", // Dimmed background
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: Colors.palette.white,
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 8,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 24,
  },
  counterBtn: {
    width: 64, // Bigger touch area
    height: 64,
    borderRadius: 20,
    backgroundColor: "#27272A", // Zinc 800
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.palette.white,
    minWidth: 80,
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: SessionColors.BLUE,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  saveBtnText: {
    color: Colors.palette.white,
    fontWeight: "700",
    fontSize: 16,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  deleteBtnText: {
    color: Colors.palette.red500,
    fontWeight: "700",
    fontSize: 14,
  },
});
