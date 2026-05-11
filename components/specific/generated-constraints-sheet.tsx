import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  ConstraintSetIds,
  Option,
  SavedConstraintSet,
} from "@/types/constraints";
import { ProjectJSON } from "@/types/json-objects";
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
  color: string;
  dataSource: ProjectJSON;
  constraintSetIds: ConstraintSetIds;
};

export default function GeneratedConstraintsSheet({
  modalVisible,
  setModalVisible,
  randomConstraints,
  dataSource,
  color,
  constraintSetIds,
}: GeneratedConstraintsSheetProps) {
  const { t } = useTranslation();
  const { globalStyles } = useStyles();
  const { session } = useAuth();
  const [visibleLogin, setVisibleLogin] = useState(false);

  const { addRecord, deleteRecord } =
    useCollection<SavedConstraintSet>("constraint_sets");

  const [savedId, setSavedId] = useState<string | number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(false);
  }, [randomConstraints]);

  useEffect(() => {
    if (session?.user && visibleLogin) {
      setVisibleLogin(false);
      setModalVisible(true);
    }
  });

  const getDifficultyGenerated = (): number => {
    let count = 0;

    Object.values(randomConstraints).forEach((option) => {
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
      if (isSaved && savedId) {
        // Delete using the ID we got back from the first save.
        await deleteRecord(savedId);
        setSavedId(null);
        setIsSaved(false);
        return;
      }

      // Create a new saved constraint set for the current generated result.
      const newConstraintSet = {
        project_type: constraintSetIds.project_type,
        constraints: constraintSetIds.constraints,
        difficulty: getDifficultyGenerated(),
      };

      const savedData = await addRecord(newConstraintSet);

      // Only mark the result as saved once the DB write succeeded.
      if (savedData?.id) {
        setSavedId(savedData.id);
        setIsSaved(true);
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
        isConfirmLoading={isSaving}
      >
        <ResultModalHeader
          difficultyIndicator={getDifficultyGenerated()}
          onSaveConstraints={onSaveConstraints}
          isSaved={isSaved}
          color={color}
        />

        <ScrollView>
          {dataSource.categories.map((cat) => {
            if (!randomConstraints[cat.name]) return null;
            return (
              <View key={cat.name} style={[globalStyles.card, { padding: 16 }]}>
                <Text style={globalStyles.label}>{cat.label || cat.name}</Text>
                <View style={globalStyles.elementAndDescriptorContainer}>
                  <Text style={[globalStyles.subtitle]}>
                    {randomConstraints[cat.name].value ??
                      t("screen:lab.empty_result")}
                  </Text>
                  {randomConstraints[cat.name].description && (
                    <Tooltip
                      title={cat.label || cat.name}
                      description={
                        randomConstraints[cat.name].description ??
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
