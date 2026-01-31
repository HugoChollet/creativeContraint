import { useStyles } from "@/hooks/use-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ModalGeneric } from "./modal-generic";

interface TooltipProps {
  title: string;
  description: string;
  color?: string;
}

function Tooltip({ title, description, color }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.textDiscreet}
        />
      </TouchableOpacity>

      <ModalGeneric visible={visible} setVisible={setVisible}>
        <View style={globalStyles.titleArea}>
          <Text style={globalStyles.subtitle}>{title}</Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={globalStyles.text}>{description}</Text>

        <TouchableOpacity
          style={[
            globalStyles.secondaryButton,
            { backgroundColor: color ?? "red" },
          ]}
          onPress={() => setVisible(false)}
        >
          <Text style={globalStyles.secondaryButtonText}>
            {t("component:tooltip.ok")}
          </Text>
        </TouchableOpacity>
      </ModalGeneric>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 6,
    justifyContent: "center",
  },
});

export default Tooltip;
