import { AddButton } from "@/components/generic/add-button";
import { FloatingButton } from "@/components/generic/floating-button";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import CategorySelector from "@/components/specific/category/category-selector";
import GeneratedConstraintsSheet from "@/components/specific/generated-constraints-sheet";
import { PresetMode } from "@/components/specific/status-selector";
import { getProjectColor } from "@/constants/theme";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { useStyles } from "@/hooks/use-styles";
import { getBundledProjectData, getProjectTitle } from "@/lib/project-data";
import {
  GeneratedConstraints,
  IdSetConstraint,
  Option,
  SelectedState,
} from "@/types/constraints";
import { CategoryJSON, ProjectJSON } from "@/types/json-objects";
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

const buildInitialSelectedState = (projectData: ProjectJSON): SelectedState => {
  const activeCategories: Record<string, boolean> = {};
  const selectedOptions: Record<string, boolean> = {};

  // Lab keeps its toggles separate from the source project, so everything starts enabled here.
  projectData.categories.forEach((category: CategoryJSON) => {
    activeCategories[category.name] = !category.disabled;

    if (category.options) {
      category.options.forEach((option) => {
        selectedOptions[`${category.name}-${option.id}`] = true;
      });

      return;
    }

    category.sub_categories?.forEach((subCategory) => {
      subCategory.options.forEach((option) => {
        selectedOptions[`${category.name}-${subCategory.name}-${option.id}`] =
          true;
      });
    });
  });

  return {
    activeCategories,
    selectedOptions,
  };
};

export default function LabScreen() {
  const { id, type } = useLocalSearchParams<{ id?: string; type?: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [randomConstraints, setRandomConstraints] =
    useState<GeneratedConstraints>({});
  const [idSetConstraint, setIdSetConstraint] = useState<IdSetConstraint>();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { activeProject, projects, loading, setActiveProjectId } =
    useHomeProjects();
  const { globalStyles, theme, colors } = useStyles();
  const router = useRouter();
  const routeProjectId = Array.isArray(id) ? id[0] : id;
  const routeType = Array.isArray(type) ? type[0] : type;

  const contextProject = useMemo(() => {
    // Prefer the DB-backed project selected on Home, but keep route-based fallback support.
    if (routeProjectId && routeProjectId !== "1") {
      return projects.find((project) => project.id === routeProjectId) ?? null;
    }

    return activeProject;
  }, [activeProject, projects, routeProjectId]);

  useEffect(() => {
    if (contextProject && contextProject.id !== activeProject?.id) {
      setActiveProjectId(contextProject.id);
    }
  }, [activeProject?.id, contextProject, setActiveProjectId]);

  const shouldWaitForContextProject =
    routeProjectId !== undefined &&
    routeProjectId !== "1" &&
    loading &&
    !contextProject;

  const fallbackProjectData = useMemo(
    () =>
      getBundledProjectData({
        projectType: routeType,
        language: i18n.language,
      }),
    [i18n.language, routeType],
  );

  const dataSource = contextProject?.dataSource ?? fallbackProjectData;
  const projectTitle = getProjectTitle(dataSource);

  const projectColor = contextProject?.color
    ? getProjectColor({
        color: contextProject.color,
        theme,
      })
    : getProjectColor({
        label: contextProject?.routeType ?? dataSource.project_type,
        theme,
      });

  const initialSelectedItems = useMemo(
    () => buildInitialSelectedState(dataSource),
    [dataSource],
  );

  const [selectedItems, setSelectedItems] =
    useState<SelectedState>(initialSelectedItems);

  useEffect(() => {
    // Switching project source should fully reset the Lab selection UI.
    setSelectedItems(initialSelectedItems);
    setRandomConstraints({});
    setIdSetConstraint(undefined);
    setExpandedCategory(null);
    setModalVisible(false);
  }, [initialSelectedItems]);

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

  if (shouldWaitForContextProject) {
    return (
      <View
        style={[
          globalStyles.screenContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <>
      <Header
        title={t("screen:lab.lab_title", {
          type: projectTitle,
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
                params: {
                  mode: "edition",
                },
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
              type: projectTitle,
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
              project_type: projectTitle,
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
