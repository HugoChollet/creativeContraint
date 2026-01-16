import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../generic/themed-text";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

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
          <View style={styles.handle} />

          <View style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              {difficultyIndicator}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <TouchableOpacity
              style={globalStyles.secondaryButton}
              onPress={onSaveConstraints}
            >
              <Ionicons size={28} name={icon} color="white" />
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
    minHeight: "40%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  contentScroll: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
  },
});
