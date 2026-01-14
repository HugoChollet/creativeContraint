import CategorySelector from "@/components/specific/category-selector";
import { PresetMode } from "@/components/specific/status-selector";
import { ThemedText } from "@/components/themed-text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useStyles } from "@/hooks/use-styles";
import i18nInstance from "@/i18n";
import { ChosenOption, SavedProjectConstraints } from "@/types/data";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [isSaved, setIsSaved] = useState(false);
  const { globalStyles } = useStyles();

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

    console.log(dataSource);

    dataSource.constraints.forEach((cat) => {
      if (cat.disabled) return;

      // Enable the category by default
      activeCats[cat.category] = true;

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
    setIsSaved(false);
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

  const getDifficultyGenerated = () => {
    let count = 0;

    dataSource.constraints.map((cat) => {
      if (cat.disabled || !randomConstraints[cat.category]) return;
      if (cat.options) {
        count +=
          cat.options.find(
            (opt) => opt.value === randomConstraints[cat.category]
          )?.rarity || 0;
      } else if (cat.sub_categories) {
        cat.sub_categories.map((subCat) => {
          count +=
            subCat.options.find((opt) =>
              randomConstraints[cat.category].includes(opt.value)
            )?.rarity || 0;
        });
      }
    });
    return count;
  };

  const getConstraintData = (): ChosenOption => {
    const selectedData: ChosenOption = {};

    dataSource.constraints.forEach((cat) => {
      const generatedValue = randomConstraints[cat.category];
      if (!generatedValue) return;

      if (cat.options) {
        const foundOption = cat.options.find(
          (opt) => opt.value === generatedValue
        );
        if (foundOption) {
          selectedData[cat.category] = foundOption;
        }
      } else if (cat.sub_categories) {
        cat.sub_categories.forEach((subCat) => {
          const foundSubOption = subCat.options.find((opt) =>
            generatedValue.includes(opt.value)
          );
          if (foundSubOption) {
            selectedData[`${cat.category}-${subCat.name}`] = foundSubOption;
          }
        });
      }
    });

    return selectedData;
  };

  const onSaveConstraints = () => {
    const constraints = getConstraintData();

    // Ensure we have generated something before saving
    if (Object.keys(constraints).length === 0) {
      console.warn("No constraints generated yet.");
      return;
    }
    if (!isSaved) {
      const saving: SavedProjectConstraints = {
        id: Date.now(),
        project_type: dataSource.project_type,
        constraints: constraints,
        difficulty: getDifficultyGenerated(),
        createdAt: new Date(),
      };
      console.log("Saving project:", saving);
      // Here you would typically call an API, use AsyncStorage, or dispatch to Redux/Zustand
    } else {
      console.log("unsaving ?");
    }
    console.log(isSaved);

    setIsSaved(!isSaved);
    //setModalVisible(false);
  };

  if (!dataSource)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title} type="title">
        {t("screen:lab.lab_title", { type: dataSource.project_type })}
      </ThemedText>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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

      <TouchableOpacity
        style={styles.showResultButton}
        onPress={() => {
          console.log(randomConstraints);
          setModalVisible(true);
        }}
        disabled={Object.keys(randomConstraints).length === 0}
      >
        <Text style={globalStyles.secondaryButtonText}>A</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={globalStyles.secondaryButton}
        onPress={refreshConstraints}
      >
        <Text style={globalStyles.secondaryButtonText}>
          {t("screen:lab.generate_button", { type: dataSource.project_type })}
        </Text>
      </TouchableOpacity>

      <BottomSheet
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t("screen:lab.constraints_title", {
          type: dataSource.project_type,
        })}
        buttonText={t("screen:lab.back_button")}
        difficultyIndicator={getDifficultyGenerated()}
        onSaveConstraints={onSaveConstraints}
        icon={isSaved ? "bookmark" : "bookmark-outline"}
      >
        {dataSource.constraints.map((cat) => {
          if (!randomConstraints[cat.category]) return null;
          return (
            <View key={cat.category} style={styles.modalResultBox}>
              <Text style={styles.modalCategoryLabel}>
                {cat.label || cat.category}
              </Text>
              <Text style={styles.modalValueText}>
                {randomConstraints[cat.category] ??
                  t("screen:lab.empty_result")}
              </Text>
            </View>
          );
        })}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark theme to match ThemedText
  },
  title: {
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 32,
  },
  scroll: {
    flex: 0.6, // Gives the list area most of the space
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  resultsContainer: {
    flex: 0.4, // Area for the generated output
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    // Add shadow/elevation for a "floating sheet" look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  resultBox: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  dimText: {
    color: "#888",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    color: "#007AFF", // Vibrant blue for the actual constraint
    fontWeight: "600",
  },
  showResultButton: {
    position: "absolute",
    bottom: 64,
    alignSelf: "center",
    backgroundColor: "#767676ff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 32,
    borderRadius: 32,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalResultBox: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalCategoryLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalValueText: {
    color: "#0A84FF", // Brighter blue for high contrast
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
});
