import { BottomSheet } from "@/components/generic/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  ConstraintSetData,
  ConstraintSetIds,
  Option,
  SavedConstraintSet,
} from "@/types/constraints";
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
  dataSource: ConstraintSetData;
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
      const newConstraintSet = {
        project_type: constraintSetIds.project_type,
        constraints: constraintSetIds.constraints,
        difficulty: getDifficultyGenerated(),
      };

      const savedData = await addRecord(newConstraintSet);

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
