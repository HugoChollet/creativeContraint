import { CategoryJSON } from "@/types/json-objects";
import { useMemo } from "react";
import { useTranslationTool } from "./use-translation";
export interface TranslatedRow {
  label: string;
  displayValue: string;
  description?: string;
}

export const useProjectTranslations = (
  constraintsData: Record<string, number>, // Now expects Record<string, number>
  dataSheet: CategoryJSON[],
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

    Object.entries(constraintsData).forEach(([key, id]) => {
      // Handle both '-' and '_' as separators for sub-categories
      const separator = key.includes("_") ? "_" : "-";
      const [baseCat, subCat] = key.split(separator);

      if (!groups[baseCat]) groups[baseCat] = { values: {}, descriptions: {} };

      const subKey = subCat || "default";

      // IMPORTANT: Since key might have '_', we normalize it back to '-'
      // if your getTranslation logic expects hyphenated parents
      const translationKey = subCat ? `${baseCat}-${subCat}` : baseCat;

      groups[baseCat].values[subKey] = getTranslation(
        "Option",
        translationKey,
        id,
      );
      groups[baseCat].descriptions[subKey] = getTranslation(
        "Description",
        translationKey,
        id,
      );
    });

    return Object.entries(groups).map(([baseCatKey, groupData]) => {
      const masterCat = dataSheet.find((c) => c.name === baseCatKey);
      const categoryLabel = masterCat?.label || masterCat?.name || baseCatKey;

      let displayValue = "";
      let description = "";

      if (masterCat?.tabs && masterCat.tabs.length > 0) {
        displayValue = masterCat.tabs
          .map((tab) => groupData.values[tab])
          .filter(Boolean)
          .join(" : ");

        description = masterCat.tabs
          .map((tab) => groupData.descriptions[tab])
          .filter((desc) => desc && desc.length > 0)
          .join("\n• ");
        if (description) description = "• " + description;
      } else {
        displayValue = groupData.values["default"] || "";
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
