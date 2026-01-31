import { Category } from "@/types/constraints";
import { useMemo } from "react";
import { useTranslationTool } from "./use-translation";

export interface TranslatedRow {
  label: string;
  displayValue: string;
}

export const useProjectTranslations = (
  constraintsData: Record<string, any>,
  dataSheet: Category[],
) => {
  console.log("useProjectTranslation");

  const { getTranslation } = useTranslationTool(dataSheet);

  const translatedConstraints = useMemo((): TranslatedRow[] => {
    if (!constraintsData || !dataSheet) return [];

    // 1. Group raw data by base category (e.g., 'Scene')
    const groups: Record<string, Record<string, string>> = {};

    Object.entries(constraintsData).forEach(([key, info]: [string, any]) => {
      const [baseCat, subCat] = key.split("-");
      if (!groups[baseCat]) groups[baseCat] = {};

      const subKey = subCat || "default";
      groups[baseCat][subKey] = getTranslation("Option", key, info.id);
    });

    console.log(groups);

    // 2. Build ordered array based on the DataSheet's 'tabs' configuration
    return Object.entries(groups).map(([baseCatKey, subValues]) => {
      const masterCat = dataSheet.find((c) => c.category === baseCatKey);
      const categoryLabel =
        masterCat?.label || masterCat?.category || baseCatKey;

      let displayValue = "";

      if (masterCat?.tabs && masterCat.tabs.length > 0) {
        // Enforce order based on tabs array
        displayValue = masterCat.tabs
          .map((tabName) => subValues[tabName])
          .filter(Boolean)
          .join(" : ");
      } else {
        // Single category value
        displayValue = subValues["default"] || "";
      }

      return {
        label: categoryLabel,
        displayValue,
      };
    });
  }, [constraintsData, dataSheet, getTranslation]);

  return { translatedConstraints };
};
