import { useStyles } from "@/hooks/use-styles";
import {
  Category,
  Option,
  SelectedState,
  SubCategory,
} from "@/types/constraints";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ConstraintOption } from "./constraint-option";
import { PresetMode, StatusSelector } from "./status-selector";

interface CategoryProps {
  category: Category;
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
}: CategoryProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mode, setMode] = useState<PresetMode>("all");
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const isEnabled = !!selectedItems.activeCategories[category.category];
  const hasSubCategories =
    category.sub_categories && category.sub_categories.length > 0;

  const handleToggleExpand = () => {
    if (!isEnabled) return;
    onExpand();
  };

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
      <Pressable onPress={handleToggleExpand} style={globalStyles.headerRow}>
        <Pressable
          onPress={() => {
            onToggleCategory(category.category);
            if (isExpanded) handleToggleExpand();
          }}
        >
          <Ionicons
            name={isEnabled ? "checkbox" : "square-outline"}
            size={24}
            color={isEnabled ? color : colors.disable}
          />
        </Pressable>

        <View style={styles.titleArea}>
          <Text
            style={[
              globalStyles.text,
              { color: isEnabled ? colors.text : colors.disable },
            ]}
          >
            {category.label || category.category}
          </Text>
          <Text
            style={[
              globalStyles.discreetText,
              { color: isEnabled ? colors.textDiscreet : colors.disable },
            ]}
          >
            {t("component:status." + mode)}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={isEnabled ? colors.textDiscreet : colors.disable}
        />
      </Pressable>

      {isExpanded && isEnabled && (
        <View style={styles.expandedContent}>
          <View style={styles.fixedSelectorWrapper}>
            <StatusSelector
              currentMode={mode}
              onSelect={(newMode) => {
                setMode(newMode);
                onBulkUpdate(category.category, currentOptions, newMode);
              }}
            />
          </View>

          {hasSubCategories && (
            <View style={[globalStyles.tabContainer, { marginHorizontal: 12 }]}>
              {category.sub_categories!.map((sub, index) => (
                <Pressable
                  key={sub.name}
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
                    {sub.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <ScrollView nestedScrollEnabled={true}>
            {currentOptions.map((opt: Option) => {
              // Create a unique key for selection state: "Category-SubName-ID" or "Category-ID"
              const selectionKey = hasSubCategories
                ? `${category.category}-${currentSubCategory?.name}-${opt.id}`
                : `${category.category}-${opt.id}`;

              return (
                <ConstraintOption
                  key={opt.id}
                  option={opt}
                  isParentEnabled={isEnabled}
                  isSelected={!!selectedItems.selectedOptions[selectionKey]}
                  color={color}
                  onToggle={(id) => {
                    setMode("custom");
                    // Pass the specialized key to the parent handler
                    const fullKey = hasSubCategories
                      ? `${category.category}-${currentSubCategory?.name}`
                      : category.category;
                    onToggleOption(fullKey, id);
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
  titleArea: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedContent: { flex: 1, marginTop: 12 },
  fixedSelectorWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
