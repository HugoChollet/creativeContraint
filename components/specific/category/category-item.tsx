import ExpandableHeader from "@/components/generic/expandable-header";
import { Item } from "@/components/generic/item";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Crud, { Action, CrudActionItem } from "../../generic/crud";

interface CategoryItemProps {
  onDelete?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onFork?: (category: Category) => void;
  onPublish?: () => void;
  projectColor: string;
  category: Category;
  selected: boolean;
  onToggleCategory: (category: Category) => void;
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
  selected,
  onToggleCategory,
  category,
  expanded,
  toggleExpand,
  type,
}: CategoryItemProps) {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();
  const isPersonalCategory =
    type === t("screen:category_browse.personal_section");

  const actions: CrudActionItem[] = [
    ...(isPersonalCategory && onEdit
      ? [{ action: Action.EDIT, onPress: () => onEdit(category) }]
      : []),
    ...(isPersonalCategory && onDelete
      ? [{ action: Action.DELETE, onPress: () => onDelete(category) }]
      : []),
    ...(isPersonalCategory && onPublish
      ? [{ action: Action.PUBLISH, onPress: onPublish }]
      : []),
    ...(!isPersonalCategory && onFork
      ? [{ action: Action.FORK, onPress: () => onFork(category) }]
      : []),
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
      }}
    >
      <View style={[globalStyles.card, { width: "100%" }]}>
        <ExpandableHeader
          title={category.name}
          description={category.description}
          tags={category.tags}
          onToggle={() => onToggleCategory(category)}
          isExpanded={expanded}
          onExpand={() => toggleExpand()}
          color={projectColor}
          isEnabled={selected}
          subtitle={
            category.options
              ? t("component:category_item.possibilities", {
                  count: category.options.length,
                })
              : undefined
          }
        />
        {expanded && (
          <>
            <Crud actions={actions} color={projectColor} />
            <View>
              {category.options
                ? category.options.map((item) => (
                    <View key={item.id.toString()} style={{ padding: 8 }}>
                      <Item
                        title={item.value}
                        subtitle={
                          t("component:constraint-selector.difficulty") +
                          item.difficulty
                        }
                        description={item.description}
                        color={projectColor}
                      />
                    </View>
                  ))
                : null}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
