import { OptionItem } from "@/components/generic/option-item";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import Crud from "../../generic/crud";
import CategoryHeader from "./category-header";

interface CategoryItemProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  projectColor: string;
  category: Category;
  expanded: boolean;
  toggleExpand: () => void;
  type: string;
}

export default function CategoryItem({
  onDelete,
  onEdit,
  onFork,
  projectColor,
  category,
  expanded,
  toggleExpand,
  type,
}: CategoryItemProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={[globalStyles.card, { width: 300 }]}>
        <CategoryHeader
          category={category}
          onToggleCategory={() => setIsEnabled(!isEnabled)}
          isExpanded={expanded}
          onExpand={() => toggleExpand()}
          color={projectColor}
          isEnabled={isEnabled}
          subtitle={
            category.options
              ? t("component:category_item.possibilities", {
                  count: category.options.length,
                })
              : undefined
          }
        />
        {expanded && category.options && (
          <FlatList
            data={category.options}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 8 }}>
                <OptionItem option={item} color={projectColor} />
              </View>
            )}
          />
        )}
      </View>
      <Crud
        onDelete={
          type === t("screen:category_browse.personal_section")
            ? onDelete
            : undefined
        }
        onFork={
          type !== t("screen:category_browse.personal_section")
            ? onFork
            : undefined
        }
        onEdit={
          type === t("screen:category_browse.personal_section")
            ? onEdit
            : undefined
        }
        color={projectColor}
      />
    </View>
  );
}
