import { OptionItem } from "@/components/generic/option-item";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import Crud, { Action, CrudActionItem } from "../../generic/crud";
import CategoryHeader from "./category-header";

interface CategoryItemProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  onPublish?: () => void;
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
  onPublish,
  projectColor,
  category,
  expanded,
  toggleExpand,
  type,
}: CategoryItemProps) {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);
  const isPersonalCategory =
    type === t("screen:category_browse.personal_section");

  const actions: CrudActionItem[] = [
    ...(isPersonalCategory && onEdit
      ? [{ action: Action.EDIT, onPress: onEdit }]
      : []),
    ...(isPersonalCategory && onDelete
      ? [{ action: Action.DELETE, onPress: onDelete }]
      : []),
    ...(isPersonalCategory && onPublish
      ? [{ action: Action.PUBLISH, onPress: onPublish }]
      : []),
    ...(!isPersonalCategory && onFork
      ? [{ action: Action.FORK, onPress: onFork }]
      : []),
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
      }}
    >
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
      <Crud actions={actions} color={projectColor} />
    </View>
  );
}
