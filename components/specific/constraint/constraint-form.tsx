import { useStyles } from "@/hooks/use-styles";
import { Option } from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Description from "../../generic/description";
import { NumberPicker } from "../../generic/number-picker";
interface ConstraintSelectorFormProps {
  submit: (option: Option) => void;
  editedOption?: Option;
  generatorColor: string;
}

export default function ConstraintSelectorForm({
  submit,
  generatorColor,
  editedOption,
}: ConstraintSelectorFormProps) {
  const { globalStyles, colors } = useStyles();
  const generatorColorSoft = generatorColor.replace(/[\d.]+\)$/g, `0.2)`);
  const { t } = useTranslation();
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [option, setOption] = useState<Option>({
    id: Math.random() * 1000000,
    value: "",
    description: "",
    difficulty: 1,
  });

  useEffect(() => {
    if (editedOption) {
      setOption(editedOption);
    }
  }, [editedOption]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TextInput
            style={[
              globalStyles.input,
              styles.nameInput,
              { borderColor: generatorColorSoft },
            ]}
            placeholder={t("component:constraint_option_form.name_placeholder")}
            placeholderTextColor={colors.placeholder}
            value={option.value}
            onChangeText={(text) => setOption({ ...option, value: text })}
          />

          <TouchableOpacity
            style={globalStyles.transparentButton}
            onPress={() => setIsDescExpanded(!isDescExpanded)}
          >
            <Ionicons
              name={isDescExpanded ? "chevron-up" : "chevron-down"}
              size={32}
              color={generatorColor}
            />
          </TouchableOpacity>

          <NumberPicker
            min={1}
            max={5}
            initialValue={option.difficulty}
            onValueChange={(value) =>
              setOption({ ...option, difficulty: value })
            }
          />
        </View>

        <TouchableOpacity
          style={globalStyles.transparentButton}
          onPress={() => {
            submit({ ...option, id: Math.random() * 1000000 });
            setOption({
              id: Math.random() * 1000000,
              value: "",
              description: "",
              difficulty: option.difficulty,
            });
          }}
          disabled={option.value === ""}
        >
          <Ionicons
            name="add"
            size={32}
            color={option.value === "" ? colors.disable : generatorColor}
          />
        </TouchableOpacity>
      </View>
      {isDescExpanded && (
        <Description
          description={option.description ?? ""}
          setDescription={(text) => setOption({ ...option, description: text })}
          placeholder={t(
            "component:constraint_option_form.description_placeholder",
          )}
          generatorColor={generatorColor}
          height={86}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
});
