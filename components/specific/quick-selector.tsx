import ExpandableHeader from "@/components/generic/expandable-header";
import {
  getConstraintCategoryIdentifier,
  getConstraintSelectionKey,
} from "@/lib/constraint-set-data";
import { useStyles } from "@/hooks/use-styles";
import { Option, SelectedState, SubCategory } from "@/types/constraints";
import { CategoryJSON } from "@/types/json-objects";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ConstraintSelector } from "./constraint/constraint-selector";
import { PresetMode, StatusSelector } from "./status-selector";

type QuickSelectorOptionSelection = {
  key: string;
  option: Option;
};

interface QuickSelectorProps {
  category: CategoryJSON;
  selectedItems: SelectedState;
  onToggleCategory: (categoryKey: string) => void;
  onToggleOption: (selectionKey: string) => void;
  onBulkUpdate: (
    selections: QuickSelectorOptionSelection[],
    mode: PresetMode,
  ) => void;
  isExpanded: boolean;
  onExpand: () => void;
  color?: string;
}

export default function QuickSelector({
  category,
  selectedItems,
  onToggleCategory,
  onToggleOption,
  onBulkUpdate,
  isExpanded,
  onExpand,
  color,
}: QuickSelectorProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mode, setMode] = useState<PresetMode>("all");
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();
  const hasSubCategories =
    category.sub_categories && category.sub_categories.length > 0;
  const categoryStateKey = getConstraintCategoryIdentifier(category);
  const isEnabled =
    selectedItems.activeCategories[categoryStateKey] ?? !category.disabled;

  const currentSubCategory: SubCategory | null = hasSubCategories
    ? category.sub_categories![activeTabIndex]
    : null;

  const currentOptionSelections = useMemo(
    () =>
      (hasSubCategories
        ? currentSubCategory?.options || []
        : category.options || []
      ).map((option) => ({
        key: getConstraintSelectionKey(
          category,
          option.id,
          currentSubCategory?.name,
        ),
        option,
      })),
    [category, currentSubCategory?.name, currentSubCategory?.options, hasSubCategories],
  );

  const getSubtitle = () => {
    if (mode === "all" || mode === "none") return t("component:status." + mode);

    const selectedCount = currentOptionSelections.filter(
      ({ key }) => selectedItems.selectedOptions[key],
    ).length;
    const totalOptionsCount = currentOptionSelections.length;

    return (
      selectedCount +
      " / " +
      totalOptionsCount +
      " - " +
      t("component:status." + mode)
    );
  };

  return (
    <View
      style={[
        globalStyles.card,
        !isEnabled && { borderColor: colors.disable },
        isExpanded && { height: 500 },
      ]}
    >
      <ExpandableHeader
        title={category.label || category.name}
        description={category.description}
        tags={category.tags}
        onToggle={() => onToggleCategory(categoryStateKey)}
        isExpanded={isExpanded}
        onExpand={onExpand}
        color={color}
        isEnabled={isEnabled}
        subtitle={getSubtitle()}
      />

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.fixedSelectorWrapper}>
            <StatusSelector
              currentMode={mode}
              onSelect={(newMode) => {
                if (!isEnabled) {
                  onToggleCategory(categoryStateKey);
                }

                setMode(newMode);
                onBulkUpdate(currentOptionSelections, newMode);
              }}
            />
          </View>

          {hasSubCategories && (
            <View style={[globalStyles.tabContainer, { marginHorizontal: 12 }]}>
              {category.sub_categories!.map((sub, index) => (
                <Pressable
                  key={sub.label ?? sub.name}
                  onPress={() => setActiveTabIndex(index)}
                  style={[
                    globalStyles.tabSegment,
                    activeTabIndex === index && {
                      backgroundColor: colors.shadeContainer,
                    },
                  ]}
                >
                  <Text
                    style={[
                      globalStyles.tabText,
                      activeTabIndex === index
                        ? { color: color }
                        : { color: colors.disable },
                    ]}
                  >
                    {sub.label ?? sub.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <ScrollView nestedScrollEnabled={true}>
            {currentOptionSelections
              .sort((left, right) =>
                left.option.value.localeCompare(right.option.value),
              )
              .map(({ key, option }) => (
                <ConstraintSelector
                  key={option.id}
                  option={option}
                  isParentEnabled={true}
                  isSelected={!!selectedItems.selectedOptions[key]}
                  color={color}
                  onToggle={() => {
                    if (!isEnabled) {
                      onToggleCategory(categoryStateKey);
                    }

                    setMode("custom");
                    onToggleOption(key);
                  }}
                />
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expandedContent: { flex: 1, marginTop: 12 },
  fixedSelectorWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
