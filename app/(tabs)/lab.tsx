import { FloatingButton } from "@/components/generic/floating-button";
import { ThemedText } from "@/components/generic/themed-text";
import CategorySelector from "@/components/specific/category-selector";
import GeneratedConstraintsModal from "@/components/specific/generated-constraints-modal";
import { PresetMode } from "@/components/specific/status-selector";
import { useStyles } from "@/hooks/use-styles";
import i18nInstance from "@/i18n";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  GeneratedConstraints,
  Option,
  ProjectData,
  SelectedState,
} from "../../types/constraints";

const typeMapping: Record<string, string> = {
  music: "music",
  book: "book",
  photography: "photo",
  videofiction: "videoFiction",
  videointernet: "videoInternet",
};

export default function LabScreen() {
  const { type } = useLocalSearchParams<{ id: string; type: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [randomConstraints, setRandomConstraints] =
    useState<GeneratedConstraints>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const rawType = (
    Array.isArray(type) ? type[0] : type ?? "book"
  ).toLowerCase();
  const typeKey = typeMapping[rawType] || "book";

  const dataSource = useMemo(() => {
    const data = i18nInstance.getResourceBundle(i18nInstance.language, typeKey);
    if (!data)
      console.error(
        `Namespace "${typeKey}" does not exist for "${i18nInstance.language}"`
      );
    return data as ProjectData;
  }, [i18nInstance.language, typeKey]);

  // Helper to build initial state where everything is ON
  const getInitialState = (): SelectedState => {
    const activeCats: Record<string, boolean> = {};
    const selOpts: Record<string, boolean> = {};

    dataSource.constraints.forEach((cat) => {
      if (cat.disabled) {
        activeCats[cat.category] = false;
      } else {
        // Enable the category by default
        activeCats[cat.category] = true;
      }

      if (cat.options) {
        // Enable every option by default
        cat.options.forEach((opt) => {
          selOpts[`${cat.category}-${opt.id}`] = true;
        });
      } else if (cat.sub_categories) {
        // Enable every subcategory by default
        cat.sub_categories.forEach((subCat) => {
          subCat.options.forEach((opt) => {
            selOpts[`${cat.category}-${subCat.name}-${opt.id}`] = true;
          });
        });
      }
    });

    return {
      activeCategories: activeCats,
      selectedOptions: selOpts,
    };
  };

  const [selectedItems, setSelectedItems] =
    useState<SelectedState>(getInitialState);

  useEffect(() => {
    setSelectedItems(getInitialState());
    setRandomConstraints({});
  }, [type]);

  const toggleCategory = (name: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      activeCategories: {
        ...prev.activeCategories,
        [name]: !prev.activeCategories[name],
      },
    }));
  };

  const toggleOption = (catName: string, id: number) => {
    const key = `${catName}-${id}`;
    setSelectedItems((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [key]: !prev.selectedOptions[key],
      },
    }));
  };

  const handleToggleExpand = (categoryName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) =>
      prev === categoryName ? null : categoryName
    );
  };

  function refreshConstraints() {
    const results: GeneratedConstraints = {};

    dataSource.constraints.forEach((cat) => {
      if (selectedItems.activeCategories[cat.category]) {
        const availableOptions = cat.options
          ? cat.options.filter(
              (opt) =>
                selectedItems.selectedOptions[`${cat.category}-${opt.id}`]
            )
          : cat.sub_categories
          ? cat.sub_categories.flatMap((subCat) =>
              subCat.options.filter(
                (opt) =>
                  selectedItems.selectedOptions[
                    `${cat.category}-${subCat.name}-${opt.id}`
                  ]
              )
            )
          : [];

        if (availableOptions.length > 0) {
          results[cat.category] = "";
          if (cat.options) {
            const randomIndex = Math.floor(
              Math.random() * availableOptions.length
            );
            results[cat.category] = availableOptions[randomIndex].value;
          } else if (cat.sub_categories) {
            // Concat all subCat result to result
            for (const subCat of cat.sub_categories) {
              const randomIndex = Math.floor(
                Math.random() * subCat.options.length
              );
              results[cat.category] += " " + subCat.options[randomIndex].value;
            }
          }
        }
      }
    });

    setRandomConstraints(results);
    setModalVisible(true);
  }

  const bulkUpdateOptions = (
    categoryName: string,
    options: Option[],
    mode: PresetMode
  ) => {
    setSelectedItems((prev) => {
      const newOptions = { ...prev.selectedOptions };

      options.forEach((opt) => {
        const key = `${categoryName}-${opt.id}`;
        if (mode === "all") newOptions[key] = true;
        else if (mode === "none") newOptions[key] = false;
        else if (mode === "easy") newOptions[key] = opt.rarity <= 2;
        else if (mode === "hard") newOptions[key] = opt.rarity >= 3;
        // 'custom' does nothing in bulk; it's handled by manual clicks
      });

      return { ...prev, selectedOptions: newOptions };
    });
  };

  if (!dataSource)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={[{ flex: 1 }, globalStyles.backgroundColor]}>
      <ScrollView
        style={globalStyles.shadeScroll}
        contentContainerStyle={styles.content}
      >
        <ThemedText style={globalStyles.subtitle} type="title">
          {t("screen:lab.lab_title", { type: dataSource.project_type })}
        </ThemedText>
        {dataSource.constraints.map((cat) => (
          <CategorySelector
            key={cat.category}
            category={cat}
            selectedItems={selectedItems}
            onToggleCategory={toggleCategory}
            onToggleOption={toggleOption}
            onBulkUpdate={bulkUpdateOptions}
            isExpanded={expandedCategory === cat.category}
            onExpand={() => handleToggleExpand(cat.category)}
          />
        ))}
      </ScrollView>

      <View style={styles.floatingButtonsWrapper} pointerEvents="box-none">
        <FloatingButton
          onPress={() => {
            setModalVisible(true);
          }}
          disabled={Object.keys(randomConstraints).length === 0}
          icon="arrow-up-outline"
          bottom={-24}
          right={24}
        />
        <FloatingButton
          onPress={refreshConstraints}
          bottom={-24}
          right={120}
          label={t("screen:lab.generate_button", {
            type: dataSource.project_type,
          })}
        />
      </View>

      <GeneratedConstraintsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        randomConstraints={randomConstraints}
        dataSource={dataSource}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  floatingButtonsWrapper: {
    // Container should be floating and not buttons in this case
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
