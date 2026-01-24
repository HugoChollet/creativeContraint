import { useStyles } from "@/hooks/use-styles";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonText?: string;
  color: string;
}

export function BottomSheet({
  isVisible,
  onClose,
  children,
  buttonText = "Close",
  color,
}: BottomSheetProps) {
  const { globalStyles } = useStyles();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Transparent area to click and close */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[globalStyles.backgroundColor, styles.sheet]}>
          {children}

          <TouchableOpacity
            style={[globalStyles.secondaryButton, { backgroundColor: color }]}
            onPress={onClose}
          >
            <Text style={globalStyles.secondaryButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    // Change minHeight to maxHeight or a fixed height so it doesn't
    // grow past the screen boundaries
    maxHeight: "90%",
  },
});
