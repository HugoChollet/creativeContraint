import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import { Spacer } from "@/components/generic/spacer";
import GeneratedConstraintsSheet from "@/components/specific/generated-constraints-sheet";
import QuickSelector from "@/components/specific/quick-selector";
import { PresetMode } from "@/components/specific/status-selector";
import {
  isProjectLanguage,
  isProjectSupportedFileType,
  normalizeProjectTags,
} from "@/constants/project-metadata";
import { getProjectColor } from "@/constants/theme";
import { useHomeProjects } from "@/contexts/home-projects-context";
import { useStyles } from "@/hooks/use-styles";
import {
  getConstraintCategoryIdentifier,
  getConstraintSelectionKey,
  getConstraintValueKey,
  getDefaultConstraintSetName,
} from "@/lib/constraint-set-data";
import {
  LAB_GENERATION_HISTORY_LIMIT,
  loadLabGenerationHistory,
  saveLabGenerationHistory,
} from "@/lib/lab-generation-history";
import { getBundledProjectData, getProjectTitle } from "@/lib/project-data";
import {
  GeneratedConstraintSet,
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
  View,
} from "react-native";

const buildInitialSelectedState = (projectData: ProjectJSON): SelectedState => {
  const activeCategories: Record<string, boolean> = {};
  const selectedOptions: Record<string, boolean> = {};

  // Lab keeps its toggles separate from the source project, so everything starts enabled here.
  projectData.categories.forEach((category: CategoryJSON) => {
    activeCategories[getConstraintCategoryIdentifier(category)] =
      !category.disabled;

    if (category.options) {
      category.options.forEach((option) => {
        selectedOptions[getConstraintSelectionKey(category, option.id)] = true;
      });

      return;
    }

    category.sub_categories?.forEach((subCategory) => {
      subCategory.options.forEach((option) => {
        selectedOptions[
          getConstraintSelectionKey(category, option.id, subCategory.name)
        ] = true;
      });
    });
  });

  return {
    activeCategories,
    selectedOptions,
  };
};

const createGeneratedConstraintSetId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const buildGeneratedConstraintSet = (
  projectData: ProjectJSON,
  selectedItems: SelectedState,
  projectSnapshot: Pick<
    GeneratedConstraintSet,
    | "projectId"
    | "projectLabel"
    | "language"
    | "supportedFiles"
    | "tags"
    | "color"
  >,
): GeneratedConstraintSet => {
  const results: GeneratedConstraintSet["constraints"] = {};
  const ids: GeneratedConstraintSet["constraintIds"] = {};

  projectData.categories.forEach((category) => {
    const categoryIdentifier = getConstraintCategoryIdentifier(category);

    if (!selectedItems.activeCategories[categoryIdentifier]) {
      return;
    }

    if (category.options) {
      const availableOptions = category.options.filter(
        (option) => selectedItems.selectedOptions[getConstraintSelectionKey(category, option.id)],
      );

      if (availableOptions.length === 0) {
        return;
      }

      const randomOption =
        availableOptions[Math.floor(Math.random() * availableOptions.length)];

      results[categoryIdentifier] = {
        id: randomOption.id,
        value: randomOption.value,
        rarity: randomOption.rarity,
        description: randomOption.description,
      };
      ids[getConstraintValueKey(category)] = randomOption.id;
      return;
    }

    const generatedValues: string[] = [];
    let generatedRarity = 0;

    category.sub_categories?.forEach((subCategory) => {
      const availableOptions = subCategory.options.filter(
        (option) =>
          selectedItems.selectedOptions[
            getConstraintSelectionKey(category, option.id, subCategory.name)
          ],
      );

      if (availableOptions.length === 0) {
        return;
      }

      const randomOption =
        availableOptions[Math.floor(Math.random() * availableOptions.length)];

      generatedValues.push(randomOption.value);
      generatedRarity += randomOption.rarity;
      ids[getConstraintValueKey(category, subCategory.name)] = randomOption.id;
    });

    if (generatedValues.length === 0) {
      return;
    }

    results[categoryIdentifier] = {
      id: -1,
      value: generatedValues.join(" "),
      rarity: generatedRarity,
      description: "",
    };
  });

  return {
    id: createGeneratedConstraintSetId(),
    name: getDefaultConstraintSetName(projectSnapshot.projectLabel),
    ...projectSnapshot,
    generatedAt: new Date().toISOString(),
    constraints: results,
    constraintIds: ids,
    savedConstraintSetId: null,
  };
};

export default function LabScreen() {
  const { id, type } = useLocalSearchParams<{ id?: string; type?: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<
    GeneratedConstraintSet[]
  >([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number | null>(
    null,
  );
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);
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
  const projectSnapshot = useMemo(
    () => ({
      projectId: contextProject?.id ?? null,
      projectLabel: contextProject?.name ?? projectTitle,
      language:
        contextProject?.language ??
        (isProjectLanguage(dataSource.language) ? dataSource.language : null),
      supportedFiles:
        contextProject?.supported_files ??
        (isProjectSupportedFileType(dataSource.supported_files)
          ? dataSource.supported_files
          : null),
      tags: contextProject?.tags ?? normalizeProjectTags(dataSource.tags),
      color: contextProject?.color ?? null,
    }),
    [
      contextProject?.color,
      contextProject?.id,
      contextProject?.language,
      contextProject?.name,
      contextProject?.supported_files,
      contextProject?.tags,
      dataSource.language,
      dataSource.supported_files,
      dataSource.tags,
      projectTitle,
    ],
  );
  const projectHistoryKey = useMemo(() => {
    if (contextProject?.id) {
      return `project:${contextProject.id}`;
    }

    return `bundled:${routeType ?? dataSource.project_type}:${i18n.language}`;
  }, [contextProject?.id, dataSource.project_type, i18n.language, routeType]);

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
  const hasSelectedCategories = Object.values(
    selectedItems.activeCategories,
  ).some(Boolean);
  const hasGeneratedConstraints = generationHistory.length > 0;
  const currentGeneratedConstraintSet =
    currentHistoryIndex === null
      ? null
      : (generationHistory[currentHistoryIndex] ?? null);

  useEffect(() => {
    let isMounted = true;

    // Switching project source resets the Lab toggles, then rehydrates the local history for that project.
    setSelectedItems(initialSelectedItems);
    setGenerationHistory([]);
    setCurrentHistoryIndex(null);
    setIsHistoryHydrated(false);
    setExpandedCategory(null);
    setModalVisible(false);

    const hydrateGenerationHistory = async () => {
      const storedHistory = await loadLabGenerationHistory(projectHistoryKey);

      if (!isMounted) {
        return;
      }

      setGenerationHistory(storedHistory);
      setCurrentHistoryIndex(
        storedHistory.length > 0 ? storedHistory.length - 1 : null,
      );
      setIsHistoryHydrated(true);
    };

    void hydrateGenerationHistory();

    return () => {
      isMounted = false;
    };
  }, [initialSelectedItems, projectHistoryKey]);

  useEffect(() => {
    if (!isHistoryHydrated) {
      return;
    }

    void saveLabGenerationHistory(projectHistoryKey, generationHistory);
  }, [generationHistory, isHistoryHydrated, projectHistoryKey]);

  const toggleCategory = (categoryKey: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      activeCategories: {
        ...prev.activeCategories,
        [categoryKey]: !prev.activeCategories[categoryKey],
      },
    }));
  };

  const toggleOption = (selectionKey: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [selectionKey]: !prev.selectedOptions[selectionKey],
      },
    }));
  };

  const handleToggleExpand = (categoryName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) =>
      prev === categoryName ? null : categoryName,
    );
  };

  const generateConstraintSet = () => {
    const nextGeneratedConstraintSet = buildGeneratedConstraintSet(
      dataSource,
      selectedItems,
      projectSnapshot,
    );
    const nextGenerationHistory = [
      ...generationHistory,
      nextGeneratedConstraintSet,
    ].slice(-LAB_GENERATION_HISTORY_LIMIT);

    setGenerationHistory(nextGenerationHistory);
    setCurrentHistoryIndex(nextGenerationHistory.length - 1);
    setModalVisible(true);
  };

  const openLatestGeneratedConstraintSet = () => {
    if (!hasGeneratedConstraints) {
      return;
    }

    setCurrentHistoryIndex(generationHistory.length - 1);
    setModalVisible(true);
  };

  const updateGeneratedConstraintSet = (
    updatedGeneratedConstraintSet: GeneratedConstraintSet,
  ) => {
    setGenerationHistory((previousHistory) =>
      previousHistory.map((generatedConstraintSet) =>
        generatedConstraintSet.id === updatedGeneratedConstraintSet.id
          ? updatedGeneratedConstraintSet
          : generatedConstraintSet,
      ),
    );
  };

  const bulkUpdateOptions = (
    selections: { key: string; option: Option }[],
    mode: PresetMode,
  ) => {
    setSelectedItems((prev) => {
      const newOptions = { ...prev.selectedOptions };

      selections.forEach(({ key, option }) => {
        if (mode === "all") newOptions[key] = true;
        else if (mode === "none") newOptions[key] = false;
        else if (mode === "easy") newOptions[key] = option.rarity <= 2;
        else if (mode === "hard") newOptions[key] = option.rarity >= 3;
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
            <QuickSelector
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
          <Spacer height={20} />
        </ScrollView>

        <ConfirmCancelButton
          color={projectColor}
          labelConfirm={t("screen:lab.generate_button", {
            type: projectTitle,
          })}
          accessibilityLabelCancel={t("screen:lab.latest_result_button")}
          iconCancel="arrow-up-outline"
          isActive={hasSelectedCategories}
          isCancelActive={hasGeneratedConstraints}
          onClickConfirm={generateConstraintSet}
          onClickCancel={openLatestGeneratedConstraintSet}
        />

        {currentGeneratedConstraintSet && (
          <GeneratedConstraintsSheet
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            generatedConstraintSet={currentGeneratedConstraintSet}
            color={projectColor}
            dataSource={dataSource}
            historyCount={generationHistory.length}
            currentHistoryIndex={currentHistoryIndex ?? 0}
            canGenerateAnother={hasSelectedCategories}
            onGenerateAnother={generateConstraintSet}
            onNavigatePrevious={() =>
              setCurrentHistoryIndex((previousIndex) =>
                previousIndex === null ? null : Math.max(0, previousIndex - 1),
              )
            }
            onNavigateNext={() =>
              setCurrentHistoryIndex((previousIndex) =>
                previousIndex === null
                  ? null
                  : Math.min(generationHistory.length - 1, previousIndex + 1),
              )
            }
            canNavigatePrevious={(currentHistoryIndex ?? 0) > 0}
            canNavigateNext={
              (currentHistoryIndex ?? 0) < generationHistory.length - 1
            }
            onUpdateGeneratedConstraintSet={updateGeneratedConstraintSet}
          />
        )}
      </View>
    </>
  );
}
