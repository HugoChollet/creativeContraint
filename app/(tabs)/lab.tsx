import { AddButton } from "@/components/generic/add-button";
import { FloatingButton } from "@/components/generic/floating-button";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import CategorySelector from "@/components/specific/category/category-selector";
import GeneratedConstraintsSheet from "@/components/specific/generated-constraints-sheet";
import { PresetMode } from "@/components/specific/status-selector";
import { getProjectColor } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import i18nInstance from "@/i18n";
import {
  GeneratedConstraints,
  IdSetConstraint,
  Option,
  SelectedState,
} from "@/types/constraints";
import { CategoryJSON, ConstraintSetDataJSON } from "@/types/json-objects";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export const typeMapping: Record<string, string> = {
  music: "music",
  book: "book",
  photography: "photo",
  videofiction: "videoFiction",
  videointernet: "videoInternet",
  cooking: "cooking",
  boardgame: "boardGame",
};

export default function LabScreen() {
  const { type } = useLocalSearchParams<{ id: string; type: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [randomConstraints, setRandomConstraints] =
    useState<GeneratedConstraints>({});
  const [idSetConstraint, setIdSetConstraint] = useState<IdSetConstraint>();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { t } = useTranslation();
  const { globalStyles, colors, theme } = useStyles();
  const router = useRouter();

  const rawType = (
    Array.isArray(type) ? type[0] : (type ?? "book")
  ).toLowerCase();
  const typeKey = typeMapping[rawType] || "book";

  const dataSource = useMemo(() => {
    const data = i18nInstance.getResourceBundle(i18nInstance.language, typeKey);
    if (!data)
      console.error(
        `Namespace "${typeKey}" does not exist for "${i18nInstance.language}"`,
      );
    return data as ConstraintSetDataJSON;
  }, [i18nInstance.language, typeKey]);

  const projectColor = getProjectColor(dataSource.project_type, 1, theme);

  // Helper to build initial state where everything is ON
  const getInitialState = (): SelectedState => {
    const activeCats: Record<string, boolean> = {};
    const selOpts: Record<string, boolean> = {};

    dataSource.categories.forEach((cat: CategoryJSON) => {
      if (cat.disabled) {
        activeCats[cat.name] = false;
      } else {
        // Enable the category by default
        activeCats[cat.name] = true;
      }

      if (cat.options) {
        // Enable every option by default
        cat.options.forEach((opt) => {
          selOpts[`${cat.name}-${opt.id}`] = true;
        });
      } else if (cat.sub_categories) {
        // Enable every subcategory by default
        cat.sub_categories.forEach((subCat) => {
          subCat.options.forEach((opt) => {
            selOpts[`${cat.name}-${subCat.name}-${opt.id}`] = true;
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
      prev === categoryName ? null : categoryName,
    );
  };

  function refreshConstraints() {
    const results: GeneratedConstraints = {};
    const ids: IdSetConstraint = {};

    dataSource.categories.forEach((cat) => {
      if (selectedItems.activeCategories[cat.name]) {
        const availableOptions = cat.options
          ? cat.options.filter(
              (opt) => selectedItems.selectedOptions[`${cat.name}-${opt.id}`],
            )
          : cat.sub_categories
            ? cat.sub_categories.flatMap((subCat) =>
                subCat.options.filter(
                  (opt) =>
                    selectedItems.selectedOptions[
                      `${cat.name}-${subCat.name}-${opt.id}`
                    ],
                ),
              )
            : [];

        if (availableOptions.length > 0) {
          results[cat.name] = {
            id: -1,
            value: "",
            rarity: 0,
            description: "",
          };
          if (cat.options) {
            const randomIndex = Math.floor(
              Math.random() * availableOptions.length,
            );
            results[cat.name].value = availableOptions[randomIndex].value;
            results[cat.name].id = availableOptions[randomIndex].id;
            results[cat.name].rarity = availableOptions[randomIndex].rarity;
            results[cat.name].description =
              availableOptions[randomIndex].description;
            ids[cat.name] = availableOptions[randomIndex].id;
          } else if (cat.sub_categories) {
            for (const subCat of cat.sub_categories) {
              const randomIndex = Math.floor(
                Math.random() * subCat.options.length,
              );
              results[cat.name].value +=
                " " + subCat.options[randomIndex].value;
              results[cat.name].rarity += subCat.options[randomIndex].rarity;

              ids[cat.name + "_" + subCat.name] =
                subCat.options[randomIndex].id;
            }
          }
        }
      }
    });

    setIdSetConstraint(ids);
    setRandomConstraints(results);
    setModalVisible(true);
  }

  const bulkUpdateOptions = (
    categoryName: string,
    options: Option[],
    mode: PresetMode,
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
    return <ActivityIndicator size="large" color={projectColor} />;

  return (
    <>
      <Header
        title={t("screen:lab.lab_title", {
          type: dataSource.project_label ?? dataSource.project_type,
        })}
        color={projectColor}
      />
      <View style={[globalStyles.screenContainer]}>
        <ScrollView>
          {dataSource.categories.map((cat: CategoryJSON) => (
            <CategorySelector
              key={cat.name}
              category={cat}
              selectedItems={selectedItems}
              onToggleCategory={toggleCategory}
              onToggleOption={toggleOption}
              onBulkUpdate={bulkUpdateOptions}
              isExpanded={expandedCategory === cat.name}
              onExpand={() => handleToggleExpand(cat.name)}
              color={projectColor}
            />
          ))}
          <AddButton
            projectColor={projectColor}
            label={t("screen:lab.add-button.label-category")}
            onClick={() =>
              router.push({
                pathname: "/category-browse",
                params: { id: 1, type: dataSource.project_type },
              })
            }
          />
          <Spacer height={60} />
        </ScrollView>

        <View style={[styles.floatingButtonsWrapper]}>
          <FloatingButton
            onPress={() => {
              setModalVisible(true);
            }}
            color={projectColor}
            disabled={Object.keys(randomConstraints).length === 0}
            icon="arrow-up-outline"
            bottom={-24}
            right={24}
          />
          <FloatingButton
            onPress={refreshConstraints}
            color={projectColor}
            bottom={-24}
            right={120}
            label={t("screen:lab.generate_button", {
              type: dataSource.project_type,
            })}
          />
        </View>

        {idSetConstraint && (
          <GeneratedConstraintsSheet
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            randomConstraints={randomConstraints}
            color={projectColor}
            dataSource={dataSource}
            constraintSetIds={{
              project_type: dataSource.project_type,
              constraints: idSetConstraint,
            }}
          />
        )}
      </View>
    </>
  );
}

export const styles = StyleSheet.create({
  floatingButtonsWrapper: {
    // TODO Container should be floating and not buttons in this case
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
