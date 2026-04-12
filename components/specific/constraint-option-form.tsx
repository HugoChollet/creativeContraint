import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Description from "../generic/description";

interface ConstraintOptionFormProps {
  submit: (option: Option) => void;
  projectColor: string;
}

export default function ConstraintOptionForm({
  submit,
  projectColor,
}: ConstraintOptionFormProps) {
  const { globalStyles, colors } = useStyles();
  const projectColorSoft = projectColor.replace(/[\d.]+\)$/g, `0.2)`);
  const { t } = useTranslation();

  const [option, setOption] = useState<Option>({
    id: Math.random() * 1000000,
    value: "",
    description: "",
    rarity: 1,
  });

  return (
    <>
      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.label}>
          {t("component:constraint_option_form.name_label")}
        </Text>
        <TextInput
          style={[globalStyles.input, { borderColor: projectColorSoft }]}
          placeholder={t("component:constraint_option_form.name_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={option.value}
          onChangeText={(text) => setOption({ ...option, value: text })}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.label}>
          {t("component:constraint_option_form.description_label")}
        </Text>
        <Description
          description={option.description ?? ""}
          setDescription={(text) => setOption({ ...option, description: text })}
          placeholder={t(
            "component:constraint_option_form.description_placeholder",
          )}
          projectColor={projectColor}
        />
      </View>
      <TouchableOpacity
        style={[
          globalStyles.secondaryButton,
          {
            backgroundColor:
              option.value !== "" ? projectColor : colors.disable,
            marginTop: 10,
          },
        ]}
        onPress={() => submit(option)}
        disabled={option.value === ""}
      >
        <Text style={globalStyles.secondaryButtonText}>
          {t("component:constraint_option_form.submit_button")}
        </Text>
      </TouchableOpacity>
    </>
  );
}
