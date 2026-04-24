import { useStyles } from "@/hooks/use-styles";
import { hexToHsva, hsvaToHex, type HsvaColor } from "@uiw/color-convert";
import Colorful from "@uiw/react-color-colorful";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface ColorPickerProps {
  defaultValue: string;
  setColor: (color: string) => void;
  toggleOpen: (isOpen: boolean) => void;
}

export default function ColorPicker({
  defaultValue,
  setColor,
  toggleOpen,
}: ColorPickerProps) {
  const { colors } = useStyles();
  const [visible, setVisible] = useState(false);
  const [draftColor, setDraftColor] = useState<HsvaColor>(() =>
    hexToHsva(defaultValue),
  );

  useEffect(() => {
    setDraftColor(hexToHsva(defaultValue));
  }, [defaultValue]);

  const openPicker = () => {
    setDraftColor(hexToHsva(defaultValue));
    setVisible(true);
    toggleOpen(true);
  };

  const closePicker = () => {
    setColor(hsvaToHex(draftColor));
    setVisible(false);
    toggleOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        style={[
          styles.swatch,
          {
            backgroundColor: defaultValue,
            borderColor: colors.textDiscreet,
          },
        ]}
      />
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closePicker}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePicker} />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.hardContainer },
            ]}
          >
            <Colorful
              color={draftColor}
              onChange={(color) => {
                setDraftColor(color.hsva);
                setColor(hsvaToHex(draftColor));
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
});
