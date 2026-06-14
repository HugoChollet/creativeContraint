import { ModalGeneric } from "@/components/generic/modal-generic";
import { SegmentedTabs } from "@/components/generic/segmented-tabs";
import Auth from "@/components/specific/auth";
import { ConstraintSetCommunityList } from "@/components/specific/constraint/constraint-set-community-list";
import { ConstraintSetPersonalList } from "@/components/specific/constraint/constraint-set-personal-list";
import { useAuth } from "@/contexts/auth-context";
import { useCollection } from "@/hooks/use-collection";
import { useStyles } from "@/hooks/use-styles";
import {
  CONSTRAINT_SET_SELECT,
  getConstraintSetName,
  getConstraintSetProjectLanguage,
  getConstraintSetProjectLabel,
  getConstraintSetProjectSupportedFile,
  getConstraintSetProjectTags,
} from "@/lib/constraint-set-data";
import { SavedConstraintSet } from "@/types/constraints";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Text, View } from "react-native";

type ConstraintSetTab = "personal" | "community";

const buildSavedConstraintSetPayload = (item: SavedConstraintSet) => ({
  name: getConstraintSetName(item),
  project_id: item.project_id ?? item.project?.id ?? null,
  project_label: getConstraintSetProjectLabel(item),
  language: getConstraintSetProjectLanguage(item),
  supported_files: getConstraintSetProjectSupportedFile(item),
  tags: getConstraintSetProjectTags(item),
  color: item.color ?? item.project?.color ?? null,
  difficulty: item.difficulty,
  constraints: item.constraints,
  is_public: false,
});

export default function ConstraintSetsScreen() {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const {
    data: constraintSets,
    loading,
    addRecord,
    deleteRecord,
    updateRecord,
    refresh,
  } = useCollection<SavedConstraintSet>("constraint_sets", {
    select: CONSTRAINT_SET_SELECT,
  });
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState<ConstraintSetTab>("personal");
  const [visibleLogin, setVisibleLogin] = useState(false);
  const [savingConstraintSetId, setSavingConstraintSetId] = useState<
    string | number | null
  >(null);
  const [publishingConstraintSetId, setPublishingConstraintSetId] = useState<
    string | number | null
  >(null);
  const personalConstraintSets = useMemo(
    () => constraintSets.filter((item) => item.owner_id === userId),
    [constraintSets, userId],
  );
  const tabs = useMemo(
    () =>
      [
        {
          label: t("screen:constraint_sets.personal_tab"),
          value: "personal" as const,
        },
        {
          label: t("screen:constraint_sets.community_tab"),
          value: "community" as const,
        },
      ] satisfies { label: string; value: ConstraintSetTab }[],
    [t],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleSaveConstraintSet = useCallback(
    async (item: SavedConstraintSet) => {
      if (!session?.user) {
        setVisibleLogin(true);
        return;
      }

      setSavingConstraintSetId(item.id);
      const savedConstraintSet = await addRecord(
        buildSavedConstraintSetPayload(item),
      );
      setSavingConstraintSetId(null);

      if (!savedConstraintSet) {
        Alert.alert(
          t("screen:constraint_set_browse.save_error_title"),
          t("screen:constraint_set_browse.save_error_message"),
        );
        return;
      }

      Alert.alert(
        t("screen:constraint_set_browse.save_success_title"),
        t("screen:constraint_set_browse.save_success_message"),
      );
    },
    [addRecord, session?.user, t],
  );

  const handlePublishConstraintSet = useCallback(
    async (item: SavedConstraintSet) => {
      if (item.is_public) {
        return;
      }

      setPublishingConstraintSetId(item.id);
      const updatedConstraintSet = await updateRecord(item.id, {
        is_public: true,
      });
      setPublishingConstraintSetId(null);

      if (!updatedConstraintSet) {
        Alert.alert(
          t("screen:constraint_sets.publish_error_title"),
          t("screen:constraint_sets.publish_error_message"),
        );
        return;
      }

      Alert.alert(
        t("screen:constraint_sets.publish_success_title"),
        t("screen:constraint_sets.publish_success_message"),
      );
    },
    [t, updateRecord],
  );

  if (loading && constraintSets.length === 0) {
    return (
      <View
        style={[globalStyles.backgroundColor, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.screenContainer]}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>
        {t("screen:constraint_sets.title")}
      </Text>

      {session?.user ? (
        <>
          <SegmentedTabs
            options={tabs}
            value={activeTab}
            onChange={setActiveTab}
            color={colors.tint}
          />
          {activeTab === "personal" ? (
            <ConstraintSetPersonalList
              constraintSets={personalConstraintSets}
              loading={loading}
              publishingConstraintSetId={publishingConstraintSetId}
              onDelete={deleteRecord}
              onPublish={handlePublishConstraintSet}
              onRefresh={refresh}
            />
          ) : (
            <ConstraintSetCommunityList
              constraintSets={constraintSets}
              currentUserId={userId}
              loading={loading}
              savingConstraintSetId={savingConstraintSetId}
              onSave={handleSaveConstraintSet}
              onRefresh={refresh}
            />
          )}
          <ModalGeneric visible={visibleLogin} setVisible={setVisibleLogin}>
            <Auth />
          </ModalGeneric>
        </>
      ) : (
        <View>
          <Text style={globalStyles.subtitle}>
            {t("screen:constraint_sets.auth_required")}
          </Text>
          <Auth />
        </View>
      )}
    </View>
  );
}
