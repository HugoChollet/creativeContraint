import { Item } from "@/components/generic/item";
import MetadataBadges from "@/components/generic/metadata-badges";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
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
  const isCommunity = type === t("screen:category_browse.community_section");

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
    ...(isCommunity && onFork
      ? [
          {
            action: Action.FAVORITE,
            onPress: () => console.log("favorite ", category.name),
          },
        ]
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
          onToggleCategory={() => onToggleCategory(category)}
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
        {category.tags?.length ? (
          <View style={{ padding: 8 }}>
            <MetadataBadges tags={category.tags} color={projectColor} />
          </View>
        ) : (
          <></>
        )}
        {expanded && category.options && (
          <FlatList
            data={category.options}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 8 }}>
                <Item
                  title={item.value}
                  subtitle={
                    t("component:constraint-selector.difficulty") + item.rarity
                  }
                  description={item.description}
                  color={projectColor}
                />
              </View>
            )}
          />
        )}
      </View>
      <Crud actions={actions} color={projectColor} />
    </View>
  );
}
