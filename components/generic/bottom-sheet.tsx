import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { useStyles } from "@/hooks/use-styles";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
  color: string;
  labelConfirm?: string;
  labelCancel?: string;
  isConfirmActive?: boolean;
  isConfirmLoading?: boolean;
}

export function BottomSheet({
  isVisible,
  onClose,
  onConfirm,
  children,
  color,
  labelConfirm,
  labelCancel,
  isConfirmActive = true,
  isConfirmLoading = false,
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

          <ConfirmCancelButton
            color={color}
            labelConfirm={labelConfirm}
            labelCancel={labelCancel}
            isActive={isConfirmActive}
            isLoading={isConfirmLoading}
            onClickConfirm={onConfirm}
            onClickCancel={onClose}
          />
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
