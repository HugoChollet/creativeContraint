import { useStyles } from "@/hooks/use-styles";
import { Option, SelectedState, SubCategory } from "@/types/constraints";
import { CategoryJSON } from "@/types/json-objects";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CategoryHeader from "./category-header";
import { ConstraintSelector } from "./constraint/constraint-selector";
import { PresetMode, StatusSelector } from "./status-selector";

interface CategorySelectorProps {
  category: CategoryJSON;
  selectedItems: SelectedState;
  onToggleCategory: (name: string) => void;
  onToggleOption: (catName: string, id: number) => void;
  onBulkUpdate: (catName: string, options: Option[], mode: PresetMode) => void;
  isExpanded: boolean;
  onExpand: () => void;
  color?: string;
}

export default function CategorySelector({
  category,
  selectedItems,
  onToggleCategory,
  onToggleOption,
  onBulkUpdate,
  isExpanded,
  onExpand,
  color,
}: CategorySelectorProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mode, setMode] = useState<PresetMode>("all");
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const [isEnabled, setIsEnabled] = useState(
    !!selectedItems.activeCategories[category.name],
  );
  const hasSubCategories =
    category.sub_categories && category.sub_categories.length > 0;

  const currentSubCategory: SubCategory | null = hasSubCategories
    ? category.sub_categories![activeTabIndex]
    : null;

  const currentOptions = hasSubCategories
    ? currentSubCategory?.options || []
    : category.options || [];

  return (
    <View
      style={[
        globalStyles.card,
        !isEnabled && { borderColor: colors.disable },
        isExpanded && { height: 500 }, // Increased height to accommodate tabs
      ]}
    >
      <CategoryHeader
        category={category}
        onToggleCategory={() => {
          onToggleCategory(category.name);
          setIsEnabled((prev) => !prev);
        }}
        isExpanded={isExpanded}
        onExpand={onExpand}
        color={color}
        isEnabled={isEnabled}
        subtitle={t("component:status." + mode)}
      />

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.fixedSelectorWrapper}>
            <StatusSelector
              currentMode={mode}
              onSelect={(newMode) => {
                setMode(newMode);
                onBulkUpdate(category.name, currentOptions, newMode);
                setIsEnabled(true);
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
            {currentOptions
              .sort((a, b) => a.value.localeCompare(b.value))
              .map((opt: Option) => {
                // Create a unique key for selection state: "Category-SubName-ID" or "Category-ID"
                const selectionKey = hasSubCategories
                  ? `${category.name}-${currentSubCategory?.name}-${opt.id}`
                  : `${category.name}-${opt.id}`;

                return (
                  <ConstraintSelector
                    key={opt.id}
                    option={opt}
                    isParentEnabled={true}
                    isSelected={!!selectedItems.selectedOptions[selectionKey]}
                    color={color}
                    onToggle={(id) => {
                      setMode("custom");
                      // Pass the specialized key to the parent handler
                      const fullKey = hasSubCategories
                        ? `${category.name}-${currentSubCategory?.name}`
                        : category.name;
                      onToggleOption(fullKey, id);
                      setIsEnabled(true);
                    }}
                  />
                );
              })}
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
