import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { ProjectData } from "@/types/constraints";
import { ChosenOption, SavedProjectConstraints } from "@/types/data";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { ModalGeneric } from "../generic/modal-generic";
import Auth from "./auth";
import ResultModalHeader from "./result-modal-header";

type GeneratedConstraintsSheetProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  randomConstraints: Record<string, string | string[]>;
  dataSource: ProjectData;
  color: string;
};

export default function GeneratedConstraintsSheet({
  modalVisible,
  setModalVisible,
  randomConstraints,
  dataSource,
  color,
}: GeneratedConstraintsSheetProps) {
  const { t } = useTranslation();
  const { globalStyles } = useStyles();
  const { session } = useAuth();
  const [visibleLogin, setVisibleLogin] = useState(false);

  const { addRecord, deleteRecord } =
    useCollection<SavedProjectConstraints>("projects");

  const [savedId, setSavedId] = useState<string | number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(false);
  }, [randomConstraints]);

  useEffect(() => {
    if (session?.user && visibleLogin) {
      setVisibleLogin(false);
      setModalVisible(true);
    }
  });

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
            selectedData[`${cat.category}-${subCat.label ?? subCat.name}`] =
              foundSubOption;
          }
        });
      }
    });

    return selectedData;
  };

  const onSaveConstraints = async () => {
    const constraints = getConstraintData();

    if (!session?.user) {
      setModalVisible(false);
      setVisibleLogin(true);
      return;
    }
    if (isSaved && savedId) {
      // Delete using the ID we got back from the first save
      await deleteRecord(savedId);
      setSavedId(null);
      setIsSaved(false);
    } else {
      setIsSaved(true);
      // Create a new record
      const newProject = {
        project_type: dataSource.project_type,
        constraints: constraints,
        difficulty: getDifficultyGenerated(),
      };

      const savedData = await addRecord(newProject);

      // If successful, Supabase returns the record including the new ID
      if (savedData?.id) {
        setSavedId(savedData.id);
      }
    }
  };

  return (
    <>
      <BottomSheet
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        buttonText={t("screen:lab.back_button")}
        color={color}
      >
        <ResultModalHeader
          difficultyIndicator={getDifficultyGenerated()}
          onSaveConstraints={onSaveConstraints}
          isSaved={isSaved}
          color={color}
        />

        <ScrollView>
          {dataSource.constraints.map((cat) => {
            if (!randomConstraints[cat.category]) return null;
            return (
              <View
                key={cat.category}
                style={[globalStyles.card, { padding: 16 }]}
              >
                <Text style={globalStyles.label}>
                  {cat.label || cat.category}
                </Text>
                <Text style={[globalStyles.subtitle]}>
                  {randomConstraints[cat.category] ??
                    t("screen:lab.empty_result")}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </BottomSheet>
      <ModalGeneric
        visible={visibleLogin}
        setVisible={(value) => {
          setVisibleLogin(value);
          setModalVisible(!value);
        }}
      >
        <Auth />
      </ModalGeneric>
    </>
  );
}
