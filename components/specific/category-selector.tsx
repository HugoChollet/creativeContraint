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
}

export default function CategorySelector({
  category,
  selectedItems,
  onToggleCategory,
  onToggleOption,
  onBulkUpdate,
  isExpanded,
  onExpand,
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
            color={isEnabled ? colors.tint : "#999"}
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
            <View style={styles.tabContainer}>
              {category.sub_categories!.map((sub, index) => (
                <Pressable
                  key={sub.name}
                  onPress={() => setActiveTabIndex(index)}
                  style={[
                    styles.tab,
                    activeTabIndex === index && styles.activeTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTabIndex === index && styles.activeTabText,
                    ]}
                  >
                    {sub.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <ScrollView
            style={styles.optionsScrollView}
            nestedScrollEnabled={true}
          >
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
  expandedContent: { flex: 1 },
  fixedSelectorWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: "#8E8E93" },
  activeTabText: { color: "#007AFF" },
  optionsScrollView: { flex: 1 },
});
