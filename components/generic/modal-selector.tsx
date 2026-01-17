import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons"; // Built into Expo
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label: string;
}

export default function ModalSelector({
  options,
  selectedValue,
  onValueChange,
  label,
}: Props) {
  const [visible, setVisible] = useState(false);
  const { globalStyles, colors } = useStyles();

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.subtitle}>{label}</Text>

      <TouchableOpacity
        style={[globalStyles.borderButton, globalStyles.dropdownButton]}
        onPress={() => setVisible(true)}
      >
        <Text style={globalStyles.borderButtonText}>
          {selectedOption?.label}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.tint} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
              ...styles.modalContent,
              backgroundColor: colors.hardContainer,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    globalStyles.optionItem,
                    item.value === selectedValue && globalStyles.activeOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      globalStyles.text,
                      item.value === selectedValue &&
                        globalStyles.activeOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 8,
    maxHeight: "30%",
  },
});
