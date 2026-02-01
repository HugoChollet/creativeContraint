import { Category } from "@/types/constraints";
import { useMemo } from "react";
import { useTranslationTool } from "./use-translation";
export interface TranslatedRow {
  label: string;
  displayValue: string;
  description?: string;
}

export const useProjectTranslations = (
  constraintsData: Record<string, any>,
  dataSheet: Category[],
) => {
  const { getTranslation } = useTranslationTool(dataSheet);

  return useMemo((): TranslatedRow[] => {
    if (!constraintsData || !dataSheet) return [];

    const groups: Record<
      string,
      {
        values: Record<string, string>;
        descriptions: Record<string, string>;
      }
    > = {};

    Object.entries(constraintsData).forEach(([key, info]: [string, any]) => {
      const [baseCat, subCat] = key.split("-");
      if (!groups[baseCat]) groups[baseCat] = { values: {}, descriptions: {} };

      const subKey = subCat || "default";
      groups[baseCat].values[subKey] = getTranslation("Option", key, info.id);
      groups[baseCat].descriptions[subKey] = getTranslation(
        "Description",
        key,
        info.id,
      );
    });

    return Object.entries(groups).map(([baseCatKey, groupData]) => {
      const masterCat = dataSheet.find((c) => c.category === baseCatKey);
      const categoryLabel =
        masterCat?.label || masterCat?.category || baseCatKey;

      let displayValue = "";
      let description = "";

      if (masterCat?.tabs && masterCat.tabs.length > 0) {
        displayValue = masterCat.tabs
          .map((tab) => groupData.values[tab])
          .filter(Boolean)
          .join(" : ");

        // Join non-empty descriptions with a bullet or newline
        description = masterCat.tabs
          .map((tab) => groupData.descriptions[tab])
          .filter((desc) => desc && desc.length > 0)
          .join("\n• ");
        if (description) description = "• " + description;
      } else {
        displayValue = groupData.values["default"] || "";
        // If flat category, prioritize option description, fallback to category description
        description =
          groupData.descriptions["default"] || masterCat?.description || "";
      }

      return {
        label: categoryLabel,
        displayValue,
        description: description || undefined,
      };
    });
  }, [constraintsData, dataSheet, getTranslation]);
};
