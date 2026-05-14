import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  getConstraintCategoryIdentifier,
  hasCustomConstraintSetName,
  normalizeConstraintSetName,
} from "@/lib/constraint-set-data";
import {
  GeneratedConstraintSet,
  SavedConstraintSet,
} from "@/types/constraints";
import { ProjectJSON } from "@/types/json-objects";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TextInput, View } from "react-native";
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
  const { globalStyles, colors } = useStyles();
  const { session } = useAuth();
  const [visibleLogin, setVisibleLogin] = useState(false);
  const [visibleNameConfirmation, setVisibleNameConfirmation] = useState(false);

  const { addRecord, deleteRecord } =
    useCollection<SavedConstraintSet>("constraint_sets");

  const [isSaving, setIsSaving] = useState(false);
  const isSaved = generatedConstraintSet.savedConstraintSetId != null;
  const categoryLabelsByName = useMemo(
    () =>
      Object.fromEntries(
        dataSource.categories.map((category) => [
          getConstraintCategoryIdentifier(category),
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

  const persistConstraintSet = async () => {
    const finalConstraintSetName = normalizeConstraintSetName(
      generatedConstraintSet.name,
      generatedConstraintSet.projectLabel,
    );

    if (finalConstraintSetName !== generatedConstraintSet.name) {
      onUpdateGeneratedConstraintSet({
        ...generatedConstraintSet,
        name: finalConstraintSetName,
      });
    }

    const newConstraintSet = {
      name: finalConstraintSetName,
      project_id: generatedConstraintSet.projectId ?? null,
      project_label:
        generatedConstraintSet.projectLabel ??
        dataSource.project_label ??
        dataSource.project_type,
      language: generatedConstraintSet.language ?? null,
      supported_files: generatedConstraintSet.supportedFiles ?? null,
      tags: generatedConstraintSet.tags ?? null,
      color: generatedConstraintSet.color ?? null,
      constraints: generatedConstraintSet.constraintIds,
      difficulty: getDifficultyGenerated(),
    };

    const savedData = await addRecord(newConstraintSet);

    if (savedData?.id) {
      onUpdateGeneratedConstraintSet({
        ...generatedConstraintSet,
        name: finalConstraintSetName,
        savedConstraintSetId: savedData.id,
      });
    }
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

      if (!hasCustomConstraintSetName(generatedConstraintSet)) {
        setVisibleNameConfirmation(true);
        return;
      }

      await persistConstraintSet();
    } finally {
      setIsSaving(false);
    }
  };

  const onConfirmConstraintSetName = async () => {
    if (isSaving) {
      return;
    }

    setVisibleNameConfirmation(false);
    setIsSaving(true);

    try {
      await persistConstraintSet();
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
          constraintSetName={generatedConstraintSet.name}
          historyCount={historyCount}
          currentHistoryIndex={currentHistoryIndex}
          canGenerateAnother={canGenerateAnother}
          canToggleSaved={isSaved || generatedConstraintsEntries.length > 0}
          isSaved={isSaved}
          isConstraintSetNameEditable={!isSaved}
          onGenerateAnother={onGenerateAnother}
          onToggleSaved={onSaveConstraints}
          onChangeConstraintSetName={(value) =>
            onUpdateGeneratedConstraintSet({
              ...generatedConstraintSet,
              name: value,
            })
          }
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
      <ModalGeneric
        visible={visibleNameConfirmation}
        setVisible={setVisibleNameConfirmation}
      >
        <Text style={globalStyles.title}>
          {t("component:result-modal-header.confirm_name_title")}
        </Text>
        <Text style={globalStyles.discreetText}>
          {t("component:result-modal-header.confirm_name_description")}
        </Text>
        <TextInput
          value={generatedConstraintSet.name}
          onChangeText={(value) =>
            onUpdateGeneratedConstraintSet({
              ...generatedConstraintSet,
              name: value,
            })
          }
          placeholder={t("component:result-modal-header.name_placeholder")}
          placeholderTextColor={colors.placeholder}
          style={[
            globalStyles.input,
            {
              borderColor: color,
              color: colors.text,
            },
          ]}
        />
        <ConfirmCancelButton
          color={color}
          labelConfirm={t("component:result-modal-header.confirm_name_button")}
          isLoading={isSaving}
          onClickConfirm={onConfirmConstraintSetName}
          onClickCancel={() => setVisibleNameConfirmation(false)}
        />
      </ModalGeneric>
    </>
  );
}
