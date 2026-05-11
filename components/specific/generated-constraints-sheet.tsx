import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  GeneratedConstraintSet,
  SavedConstraintSet,
} from "@/types/constraints";
import { ProjectJSON } from "@/types/json-objects";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { ModalGeneric } from "../generic/modal-generic";
import Tooltip from "../generic/tooltip";
import Auth from "./auth";
import ResultModalHeader from "./result-modal-header";

type GeneratedConstraintsSheetProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  generatedConstraintSet: GeneratedConstraintSet;
  color: string;
  dataSource: ProjectJSON;
  historyCount: number;
  currentHistoryIndex: number;
  canGenerateAnother?: boolean;
  onGenerateAnother: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  onUpdateGeneratedConstraintSet: (
    updatedGeneratedConstraintSet: GeneratedConstraintSet,
  ) => void;
};

export default function GeneratedConstraintsSheet({
  modalVisible,
  setModalVisible,
  generatedConstraintSet,
  dataSource,
  color,
  historyCount,
  currentHistoryIndex,
  canGenerateAnother = true,
  onGenerateAnother,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious,
  canNavigateNext,
  onUpdateGeneratedConstraintSet,
}: GeneratedConstraintsSheetProps) {
  const { t } = useTranslation();
  const { globalStyles } = useStyles();
  const { session } = useAuth();
  const [visibleLogin, setVisibleLogin] = useState(false);

  const { addRecord, deleteRecord } =
    useCollection<SavedConstraintSet>("constraint_sets");

  const [isSaving, setIsSaving] = useState(false);
  const isSaved = generatedConstraintSet.savedConstraintSetId != null;
  const categoryLabelsByName = useMemo(
    () =>
      Object.fromEntries(
        dataSource.categories.map((category) => [
          category.name,
          category.label || category.name,
        ]),
      ),
    [dataSource.categories],
  );
  const generatedConstraintsEntries = Object.entries(
    generatedConstraintSet.constraints,
  );

  useEffect(() => {
    if (session?.user && visibleLogin) {
      setVisibleLogin(false);
      setModalVisible(true);
    }
  }, [session?.user, setModalVisible, visibleLogin]);

  const getDifficultyGenerated = () => {
    let count = 0;

    Object.values(generatedConstraintSet.constraints).forEach((option) => {
      count += option.rarity;
    });
    return count;
  };

  const onSaveConstraints = async () => {
    if (isSaving) {
      return;
    }

    if (!session?.user) {
      setModalVisible(false);
      setVisibleLogin(true);
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved && generatedConstraintSet.savedConstraintSetId) {
        // Delete using the ID returned when this generated result was saved.
        await deleteRecord(generatedConstraintSet.savedConstraintSetId);
        onUpdateGeneratedConstraintSet({
          ...generatedConstraintSet,
          savedConstraintSetId: null,
        });
        return;
      }

      // Create a new saved constraint set for the current generated result.
      const newConstraintSet = {
        project_type: generatedConstraintSet.projectType,
        constraints: generatedConstraintSet.constraintIds,
        difficulty: getDifficultyGenerated(),
      };

      const savedData = await addRecord(newConstraintSet);

      // Only mark the result as saved once the DB write succeeded.
      if (savedData?.id) {
        onUpdateGeneratedConstraintSet({
          ...generatedConstraintSet,
          savedConstraintSetId: savedData.id,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BottomSheet
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={onSaveConstraints}
        color={color}
        labelConfirm={t(
          isSaved
            ? "component:result-modal-header.remove_button"
            : "component:result-modal-header.save_button",
        )}
        labelCancel={t("screen:lab.back_button")}
        isConfirmActive={isSaved || generatedConstraintsEntries.length > 0}
        isConfirmLoading={isSaving}
      >
        <ResultModalHeader
          difficultyIndicator={getDifficultyGenerated()}
          color={color}
          titleType={generatedConstraintSet.projectType}
          historyCount={historyCount}
          currentHistoryIndex={currentHistoryIndex}
          canGenerateAnother={canGenerateAnother}
          onGenerateAnother={onGenerateAnother}
          onNavigatePrevious={onNavigatePrevious}
          onNavigateNext={onNavigateNext}
          canNavigatePrevious={canNavigatePrevious}
          canNavigateNext={canNavigateNext}
          isBusy={isSaving}
        />

        <ScrollView>
          {generatedConstraintsEntries.map(([categoryName, generatedOption]) => (
            <View
              key={`${generatedConstraintSet.id}-${categoryName}`}
              style={[globalStyles.card, { padding: 16 }]}
            >
              <Text style={globalStyles.label}>
                {categoryLabelsByName[categoryName] ?? categoryName}
              </Text>
              <View style={globalStyles.elementAndDescriptorContainer}>
                <Text style={[globalStyles.subtitle]}>
                  {generatedOption.value ?? t("screen:lab.empty_result")}
                </Text>
                {generatedOption.description && (
                  <Tooltip
                    title={categoryLabelsByName[categoryName] ?? categoryName}
                    description={
                      generatedOption.description ?? t("screen:lab.empty_result")
                    }
                    color={color}
                  />
                )}
              </View>
            </View>
          ))}
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
