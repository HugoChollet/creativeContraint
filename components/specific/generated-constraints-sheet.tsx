import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import { Option, ProjectData } from "@/types/constraints";
import { SavedProjectConstraints } from "@/types/data";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { ModalGeneric } from "../generic/modal-generic";
import Tooltip from "../generic/tooltip";
import Auth from "./auth";
import ResultModalHeader from "./result-modal-header";

type GeneratedConstraintsSheetProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  randomConstraints: Record<string, Option>;
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

    Object.values(randomConstraints).forEach((option) => {
      count += option.rarity;
    });
    return count;
  };

  // const getConstraintData = (): ChosenOption => {
  //   const selectedData: ChosenOption = {};

  //   dataSource.constraints.forEach((cat) => {
  //     if (!randomConstraints[cat.category]) return;
  //     const generatedValue = randomConstraints[cat.category].value;
  //     if (!generatedValue) return;

  //     console.log("saving ", generatedValue);

  //     if (cat.options) {
  //       // TODO refacto this is not useful for non-subCategory
  //       const foundOption = cat.options.find(
  //         (opt) => opt.value === generatedValue,
  //       );
  //       if (foundOption) {
  //         selectedData[cat.category] = foundOption;
  //       }
  //     } else if (cat.sub_categories) {
  //       cat.sub_categories.forEach((subCat) => {
  //         const foundSubOption = subCat.options.find((opt) =>
  //           generatedValue.includes(opt.value),
  //         );
  //         if (foundSubOption) {
  //           selectedData[`${cat.category}-${subCat.name}`] = foundSubOption;
  //         }
  //       });
  //     }
  //   });

  //   return selectedData;
  // };

  /**
   * Transforms the current generated state into a lean object for Supabase.
   * Only categories name and id of option selected
   */
  const getConstraintData = (): Record<string, { id: number }> => {
    const selectedData: Record<string, { id: number }> = {};

    dataSource.constraints.forEach((cat) => {
      // Check if this category was even generated
      const generated = randomConstraints[cat.category];
      if (!generated) return;

      if (cat.options) {
        // FLAT CATEGORY
        // We look for the option that matches the generated value
        const foundOption = cat.options.find(
          (opt) => opt.value === generated.value,
        );
        if (foundOption) {
          selectedData[cat.category] = { id: foundOption.id };
        }
      } else if (cat.sub_categories) {
        debugger;
        // SUB-CATEGORY (e.g., Scene)
        // The 'generated.value' for a Scene is likely "Hero : saves : the town"
        // We split it to find which part belongs to which sub-category
        const valueParts = generated.value.split(" : ");

        cat.sub_categories.forEach((subCat, index) => {
          const partValue = valueParts[index];
          const foundSubOption = subCat.options.find(
            (opt) => opt.value === partValue,
          );

          if (foundSubOption) {
            selectedData[`${cat.category}-${subCat.name}`] = {
              id: foundSubOption.id,
            };
          }
        });
      }
    });

    return selectedData;
  };

  const onSaveConstraints = async () => {
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
        constraints: getConstraintData(),
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
                <View style={globalStyles.elementAndDescriptorContainer}>
                  <Text style={[globalStyles.subtitle]}>
                    {randomConstraints[cat.category].value ??
                      t("screen:lab.empty_result")}
                  </Text>
                  {randomConstraints[cat.category].description && (
                    <Tooltip
                      title={cat.label || cat.category}
                      description={
                        randomConstraints[cat.category].description ??
                        t("screen:lab.empty_result")
                      }
                      color={color}
                    />
                  )}
                </View>
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
