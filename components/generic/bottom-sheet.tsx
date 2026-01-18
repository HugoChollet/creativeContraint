import { useStyles } from "@/hooks/use-styles";
import { IoniconsName } from "@/types/Icons";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // This allows any result content
  buttonText?: string;
  difficultyIndicator?: number;
  onSaveConstraints: () => void;
  icon: IoniconsName;
}

export function BottomSheet({
  isVisible,
  onClose,
  title,
  children,
  buttonText = "Close",
  difficultyIndicator,
  onSaveConstraints,
  icon,
}: BottomSheetProps) {
  const { globalStyles, colors } = useStyles();

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
          <View style={styles.handle} />

          <View style={styles.headerContainer}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={globalStyles.title}>{difficultyIndicator}</Text>
              <Ionicons name="speedometer-outline" size={28} color="white" />
            </View>
            <Text style={globalStyles.title}>{title}</Text>
            <TouchableOpacity
              style={globalStyles.transparentButton}
              onPress={onSaveConstraints}
            >
              <Ionicons size={28} name={icon} color={colors.tint} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          <TouchableOpacity
            style={globalStyles.secondaryButton}
            onPress={onClose}
          >
            <Text style={globalStyles.secondaryButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  contentScroll: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    gap: 12,
  },
});
