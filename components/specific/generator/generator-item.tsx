import ExpandableHeader from "@/components/generic/expandable-header";
import { Item } from "@/components/generic/item";
import { useStyles } from "@/hooks/use-styles";
import { Generator } from "@/types/generators";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Crud, { Action, CrudActionItem } from "../../generic/crud";

interface GeneratorItemProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  onPublish?: () => void;
  generatorColor: string;
  generator: Generator;
  selected: boolean;
  expanded: boolean;
  toggleExpand: () => void;
  onToggleGenerator: () => void;
  type: string;
}

export default function GeneratorItem({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  generatorColor,
  selected,
  generator,
  expanded,
  toggleExpand,
  onToggleGenerator,
  type,
}: GeneratorItemProps) {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();
  const isPersonalGenerator =
    type === t("screen:generator_browse.personal_section");

  const actions: CrudActionItem[] = [
    ...(isPersonalGenerator && onEdit
      ? [{ action: Action.EDIT, onPress: onEdit }]
      : []),
    ...(isPersonalGenerator && onDelete
      ? [{ action: Action.DELETE, onPress: onDelete }]
      : []),
    ...(isPersonalGenerator && onPublish
      ? [{ action: Action.PUBLISH, onPress: onPublish }]
      : []),
    ...(!isPersonalGenerator && onFork
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
      <View style={[globalStyles.card, { width: "100%" }]}>
        <ExpandableHeader
          title={generator.name}
          description={generator.description}
          tags={generator.tags}
          onToggle={onToggleGenerator}
          isExpanded={expanded}
          onExpand={() => toggleExpand()}
          color={generatorColor}
          isEnabled={selected}
          subtitle={
            generator.categories
              ? t("component:generator_item.categories_counter", {
                  count: generator.categories.length,
                })
              : undefined
          }
        />
        {expanded && (
          <>
            <Crud actions={actions} color={generatorColor} />
            <View>
              {generator.categories
                ? generator.categories.map((item) => (
                    <View key={item.id.toString()} style={{ padding: 8 }}>
                      <Item
                        title={item.name}
                        subtitle={t(
                          "component:generator_item.constraints_counter",
                          {
                            count: item.options.length,
                          },
                        )}
                        description={item.description}
                        color={generatorColor}
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
