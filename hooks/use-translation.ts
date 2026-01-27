import { Category } from "@/types/constraints";
import { useCallback } from "react";

export const useTranslationTool = (dataSheet: Category[]) => {
  const getTranslation = useCallback(
    (
      type: "Category" | "SubCategory" | "Option",
      parent: string,
      searched: string | number
    ): string => {
      if (!dataSheet) return String(searched);

      // 1. Find the Top Level Category (e.g., "Scene" or "Genre")
      const mainCat = dataSheet.find(
        (c) => c.category === parent.split("-")[0]
      );
      if (!mainCat) return String(searched);

      switch (type) {
        case "Category":
          return mainCat.label || mainCat.category;

        case "SubCategory": {
          // parent: 'Scene', searched: '1' (index) or name
          const sub = mainCat.sub_categories?.find(
            (s, index) => s.name === searched || index === Number(searched)
          );
          return sub?.label || sub?.name || String(searched);
        }

        case "Option": {
          // If parent is 'Scene-Action', we split to find the sub_category
          const parts = parent.split("-");

          if (parts.length > 1) {
            const subCatName = parts[1];
            const sub = mainCat.sub_categories?.find(
              (s) => s.name === subCatName
            );
            const opt = sub?.options.find((o) => o.id === Number(searched));
            return opt?.value || String(searched);
          } else {
            // Flat category like "Genre"
            const opt = mainCat.options?.find((o) => o.id === Number(searched));
            return opt?.value || String(searched);
          }
        }
        default:
          return String(searched);
      }
    },
    [dataSheet]
  );

  return { getTranslation };
};
