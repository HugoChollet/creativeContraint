import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useStyles } from "@/hooks/use-styles";
import { ProjectData } from "@/types/constraints";
import { ChosenOption, SavedProjectConstraints } from "@/types/data";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type GeneratedConstraintsModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  randomConstraints: Record<string, string | string[]>;
  dataSource: ProjectData;
};

export default function GeneratedConstraintsModal({
  modalVisible,
  setModalVisible,
  randomConstraints,
  dataSource,
}: GeneratedConstraintsModalProps) {
  const { t } = useTranslation();
  const { globalStyles } = useStyles();
  const [isSaved, setIsSaved] = useState(false);

  const getDifficultyGenerated = () => {
    let count = 0;

    dataSource.constraints.map((cat) => {
      if (cat.disabled || !randomConstraints[cat.category]) return;
      if (cat.options) {
        count +=
          cat.options.find(
            (opt) => opt.value === randomConstraints[cat.category]
          )?.rarity || 0;
      } else if (cat.sub_categories) {
        cat.sub_categories.map((subCat) => {
          count +=
            subCat.options.find((opt) =>
              randomConstraints[cat.category].includes(opt.value)
            )?.rarity || 0;
        });
      }
    });
    return count;
  };

  const getConstraintData = (): ChosenOption => {
    const selectedData: ChosenOption = {};

    dataSource.constraints.forEach((cat) => {
      const generatedValue = randomConstraints[cat.category];
      if (!generatedValue) return;

      if (cat.options) {
        const foundOption = cat.options.find(
          (opt) => opt.value === generatedValue
        );
        if (foundOption) {
          selectedData[cat.category] = foundOption;
        }
      } else if (cat.sub_categories) {
        cat.sub_categories.forEach((subCat) => {
          const foundSubOption = subCat.options.find((opt) =>
            generatedValue.includes(opt.value)
          );
          if (foundSubOption) {
            selectedData[`${cat.category}-${subCat.name}`] = foundSubOption;
          }
        });
      }
    });

    return selectedData;
  };

  const onSaveConstraints = () => {
    const constraints = getConstraintData();

    // Ensure we have generated something before saving
    if (Object.keys(constraints).length === 0) {
      console.warn("No constraints generated yet.");
      return;
    }
    if (!isSaved) {
      const saving: SavedProjectConstraints = {
        id: Date.now(),
        project_type: dataSource.project_type,
        constraints: constraints,
        difficulty: getDifficultyGenerated(),
        createdAt: new Date(),
      };
      console.log("Saving project:", saving);
      // Here you would typically call an API, use AsyncStorage, or dispatch to Redux/Zustand
    } else {
      console.log("unsaving ?");
    }
    console.log(isSaved);

    setIsSaved(!isSaved);
  };

  return (
    <BottomSheet
      isVisible={modalVisible}
      onClose={() => setModalVisible(false)}
      title={t("screen:lab.constraints_title", {
        type: dataSource.project_type,
      })}
      buttonText={t("screen:lab.back_button")}
      difficultyIndicator={getDifficultyGenerated()}
      onSaveConstraints={onSaveConstraints}
      icon={isSaved ? "bookmark" : "bookmark-outline"}
    >
      {dataSource.constraints.map((cat) => {
        if (!randomConstraints[cat.category]) return null;
        return (
          <View key={cat.category} style={[globalStyles.card, { padding: 16 }]}>
            <Text style={globalStyles.label}>{cat.label || cat.category}</Text>
            <Text style={[globalStyles.subtitle]}>
              {randomConstraints[cat.category] ?? t("screen:lab.empty_result")}
            </Text>
          </View>
        );
      })}
    </BottomSheet>
  );
}
