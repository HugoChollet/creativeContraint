import { AddButton } from "@/components/generic/add-button";
import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { Header } from "@/components/generic/header";
import { ModalGeneric } from "@/components/generic/modal-generic";
import { Spacer } from "@/components/generic/spacer";
import Auth from "@/components/specific/auth";
import GeneratedConstraintsSheet from "@/components/specific/generated-constraints-sheet";
import QuickSelector from "@/components/specific/quick-selector";
import { PresetMode } from "@/components/specific/status-selector";
import {
  isGeneratorLanguage,
  isGeneratorSupportedFileType,
  normalizeGeneratorTags,
} from "@/constants/generator-metadata";
import { getGeneratorColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useHomeGenerators } from "@/contexts/home-generators-context";
import { useStyles } from "@/hooks/use-styles";
import {
  getConstraintCategoryIdentifier,
  getConstraintSelectionKey,
  getConstraintValueKey,
  getDefaultConstraintSetName,
} from "@/lib/constraint-set-data";
import {
  GENERATORS_HISTORY_LIMIT,
  loadGeneratorsHistory,
  saveGeneratorsHistory,
} from "@/lib/generators-generation-history";
import { getBundledGeneratorData, getGeneratorTitle } from "@/lib/generator-data";
import {
  GeneratedConstraintSet,
  Option,
  SelectedState,
} from "@/types/constraints";
import { CategoryJSON, GeneratorJSON } from "@/types/json-objects";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  View,
} from "react-native";

const buildInitialSelectedState = (projectData: GeneratorJSON): SelectedState => {
  const activeCategories: Record<string, boolean> = {};
  const selectedOptions: Record<string, boolean> = {};

  // Generators keep their toggles separate from the source generator, so everything starts enabled here.
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
  projectData: GeneratorJSON,
  selectedItems: SelectedState,
  generatorSnapshot: Pick<
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
        (option) =>
          selectedItems.selectedOptions[
            getConstraintSelectionKey(category, option.id)
          ],
      );

      if (availableOptions.length === 0) {
        return;
      }

      const randomOption =
        availableOptions[Math.floor(Math.random() * availableOptions.length)];

      results[categoryIdentifier] = {
        id: randomOption.id,
        value: randomOption.value,
        difficulty: randomOption.difficulty,
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
      generatedRarity += randomOption.difficulty;
      ids[getConstraintValueKey(category, subCategory.name)] = randomOption.id;
    });

    if (generatedValues.length === 0) {
      return;
    }

    results[categoryIdentifier] = {
      id: -1,
      value: generatedValues.join(" "),
      difficulty: generatedRarity,
      description: "",
    };
  });

  return {
    id: createGeneratedConstraintSetId(),
    name: getDefaultConstraintSetName(generatorSnapshot.projectLabel),
    ...generatorSnapshot,
    generatedAt: new Date().toISOString(),
    constraints: results,
    constraintIds: ids,
    savedConstraintSetId: null,
  };
};

export default function GeneratorsScreen() {
  const { id, type } = useLocalSearchParams<{ id?: string; type?: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [visibleLogin, setVisibleLogin] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<
    GeneratedConstraintSet[]
  >([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number | null>(
    null,
  );
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const { activeGenerator, generators, loading, setActiveGeneratorId } =
    useHomeGenerators();
  const { globalStyles, theme, colors } = useStyles();
  const router = useRouter();
  const routeGeneratorId = Array.isArray(id) ? id[0] : id;
  const routeType = Array.isArray(type) ? type[0] : type;

  const contextGenerator = useMemo(() => {
    // Prefer the DB-backed project selected on Home, but keep route-based fallback support.
    if (routeGeneratorId && routeGeneratorId !== "1") {
      return (
        generators.find((generator) => generator.id === routeGeneratorId) ?? null
      );
    }

    return activeGenerator;
  }, [activeGenerator, generators, routeGeneratorId]);

  useEffect(() => {
    if (contextGenerator && contextGenerator.id !== activeGenerator?.id) {
      setActiveGeneratorId(contextGenerator.id);
    }
  }, [activeGenerator?.id, contextGenerator, setActiveGeneratorId]);

  const shouldWaitForContextProject =
    routeGeneratorId !== undefined &&
    routeGeneratorId !== "1" &&
    loading &&
    !contextGenerator;

  const fallbackGeneratorData = useMemo(
    () =>
      getBundledGeneratorData({
        generatorType: routeType,
        language: i18n.language,
      }),
    [i18n.language, routeType],
  );

  const dataSource = contextGenerator?.dataSource ?? fallbackGeneratorData;
  const generatorTitle = getGeneratorTitle(dataSource);
  const generatorSnapshot = useMemo(
    () => ({
      projectId: contextGenerator?.id ?? null,
      projectLabel: contextGenerator?.name ?? generatorTitle,
      language:
        contextGenerator?.language ??
        (isGeneratorLanguage(dataSource.language) ? dataSource.language : null),
      supportedFiles:
        contextGenerator?.supported_files ??
        (isGeneratorSupportedFileType(dataSource.supported_files)
          ? dataSource.supported_files
          : null),
      tags: contextGenerator?.tags ?? normalizeGeneratorTags(dataSource.tags),
      color: contextGenerator?.color ?? null,
    }),
    [
      contextGenerator?.color,
      contextGenerator?.id,
      contextGenerator?.language,
      contextGenerator?.name,
      contextGenerator?.supported_files,
      contextGenerator?.tags,
      dataSource.language,
      dataSource.supported_files,
      dataSource.tags,
      generatorTitle,
    ],
  );
  const generatorHistoryKey = useMemo(() => {
    if (contextGenerator?.id) {
      return `project:${contextGenerator.id}`;
    }

    return `bundled:${routeType ?? dataSource.project_type}:${i18n.language}`;
  }, [contextGenerator?.id, dataSource.project_type, i18n.language, routeType]);

  const generatorColor = contextGenerator?.color
    ? getGeneratorColor({
        color: contextGenerator.color,
        theme,
      })
    : getGeneratorColor({
        label: contextGenerator?.routeType ?? dataSource.project_type,
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

  const openCategoryBrowse = useCallback(() => {
    router.push({
      pathname: "/category-browse",
      params: {
        mode: "edition",
      },
    });
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    // Switching generator source resets the toggles, then rehydrates the local history for that generator.
    setSelectedItems(initialSelectedItems);
    setGenerationHistory([]);
    setCurrentHistoryIndex(null);
    setIsHistoryHydrated(false);
    setExpandedCategory(null);
    setModalVisible(false);

    const hydrateGenerationHistory = async () => {
      const storedHistory = await loadGeneratorsHistory(generatorHistoryKey);

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
  }, [initialSelectedItems, generatorHistoryKey]);

  useEffect(() => {
    if (!session?.user || !visibleLogin) {
      return;
    }

    setVisibleLogin(false);
    openCategoryBrowse();
  }, [session?.user, visibleLogin, openCategoryBrowse]);

  useEffect(() => {
    if (!isHistoryHydrated) {
      return;
    }

    void saveGeneratorsHistory(generatorHistoryKey, generationHistory);
  }, [generationHistory, isHistoryHydrated, generatorHistoryKey]);

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
      generatorSnapshot,
    );
    const nextGenerationHistory = [
      ...generationHistory,
      nextGeneratedConstraintSet,
    ].slice(-GENERATORS_HISTORY_LIMIT);

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
        else if (mode === "easy") newOptions[key] = option.difficulty <= 2;
        else if (mode === "hard") newOptions[key] = option.difficulty >= 3;
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
        title={t("screen:generators.generator_title", {
          type: generatorTitle,
        })}
        color={generatorColor}
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
              color={generatorColor}
            />
          ))}
          <AddButton
            generatorColor={generatorColor}
            label={t("screen:generators.add-button.label-category")}
            onClick={() => {
              if (!session?.user) {
                setVisibleLogin(true);
                return;
              }

              openCategoryBrowse();
            }}
          />
          <Spacer height={20} />
        </ScrollView>

        <ConfirmCancelButton
          color={generatorColor}
          labelConfirm={t("screen:generators.generate_button", {
            type: generatorTitle,
          })}
          accessibilityLabelCancel={t("screen:generators.latest_result_button")}
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
            color={generatorColor}
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
        <ModalGeneric visible={visibleLogin} setVisible={setVisibleLogin}>
          <Auth />
        </ModalGeneric>
      </View>
    </>
  );
}
