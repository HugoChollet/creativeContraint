import { CategoryJSON } from "@/types/json-objects";
import {
  resolveConstraintCategoryContext,
  type ResolvedConstraintCategoryContext,
} from "@/lib/constraint-set-data";
import { useMemo } from "react";
export interface TranslatedRow {
  label: string;
  displayValue: string;
  description?: string;
}

export const useGeneratorTranslations = (
  constraintsData: Record<string, number>,
  dataSheet?: CategoryJSON[] | null,
) => {
  return useMemo((): TranslatedRow[] => {
    if (!constraintsData) return [];

    const groups: Record<
      string,
      {
        context: ResolvedConstraintCategoryContext | null;
        values: Record<string, string>;
        descriptions: Record<string, string>;
      }
    > = {};

    Object.entries(constraintsData).forEach(([key, id]) => {
      const context = resolveConstraintCategoryContext(key, dataSheet ?? []);
      const optionSource = context?.subCategoryName
        ? context.category?.sub_categories?.find(
            (subCategory) => subCategory.name === context.subCategoryName,
          )?.options
        : context?.category?.options;
      const option = optionSource?.find((item) => item.id === Number(id));
      const groupKey = context?.categoryIdentifier ?? key;
      const subKey = context?.subCategoryName ?? "default";

      if (!groups[groupKey]) {
        groups[groupKey] = {
          context,
          values: {},
          descriptions: {},
        };
      }

      groups[groupKey].values[subKey] = option?.value ?? String(id);
      groups[groupKey].descriptions[subKey] =
        option?.description ||
        (subKey === "default" ? context?.category?.description || "" : "");
    });

    return Object.entries(groups).map(([groupKey, groupData]) => {
      const masterCat = groupData.context?.category ?? null;
      const categoryLabel = masterCat?.label || masterCat?.name || groupKey;

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
  }, [constraintsData, dataSheet]);
};
