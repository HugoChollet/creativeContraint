import { Category } from "@/types/constraints";
import { useCallback } from "react";

export const useTranslationTool = (dataSheet: Category[]) => {
  const getTranslation = useCallback(
    (
      type: "name" | "SubCategory" | "Option" | "Description",
      parent: string,
      searched: string | number,
    ): string => {
      if (!dataSheet) return "";

      const mainCat = dataSheet.find((c) => c.name === parent.split("-")[0]);
      if (!mainCat) return "";

      switch (type) {
        case "name":
          return mainCat.label || mainCat.name;

        case "Description": {
          // If it's a subcategory key (Scene-Action), we might want the option description
          const parts = parent.split("-");
          if (parts.length > 1) {
            const sub = mainCat.sub_categories?.find(
              (s) => s.name === parts[1],
            );
            const opt = sub?.options.find((o) => o.id === Number(searched));
            return opt?.description || "";
          }
          // Otherwise, it's either the Category description or a flat Option description
          if (searched === "") return mainCat.description || "";
          const opt = mainCat.options?.find((o) => o.id === Number(searched));
          return opt?.description || "";
        }

        case "Option": {
          const parts = parent.split("-");
          if (parts.length > 1) {
            const sub = mainCat.sub_categories?.find(
              (s) => s.name === parts[1],
            );
            return (
              sub?.options.find((o) => o.id === Number(searched))?.value ||
              String(searched)
            );
          }
          return (
            mainCat.options?.find((o) => o.id === Number(searched))?.value ||
            String(searched)
          );
        }

        case "SubCategory": {
          // parent: 'Scene', searched: '1' (index) or name
          const sub = mainCat.sub_categories?.find(
            (s, index) => s.name === searched || index === Number(searched),
          );
          return sub?.label || sub?.name || String(searched);
        }
        default:
          return String(searched);
      }
    },
    [dataSheet],
  );

  return { getTranslation };
};
