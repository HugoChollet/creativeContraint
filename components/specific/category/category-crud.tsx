import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import Crud from "../../generic/crud";
import CategoryHeader from "./category-header";

interface CategoryCrudProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  projectColor: string;
  category: Category;
  expand: boolean;
  setExpand: (expanded: boolean) => void;
  type: string;
}

export default function CategoryCrud({
  onDelete,
  onEdit,
  onFork,
  projectColor,
  category,
  expand,
  setExpand,
  type,
}: CategoryCrudProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={[globalStyles.card]}>
        <CategoryHeader
          category={category}
          onToggleCategory={() => {
            console.log("toggle");
            setExpand(!isExpanded);
            setIsEnabled(!isEnabled);
          }}
          isExpanded={isExpanded}
          onExpand={() => {
            setIsExpanded(!isExpanded);
            console.log("expand to", isExpanded);
          }}
          color={projectColor}
          isEnabled={isEnabled}
          subtitle={
            category.options
              ? `${category.options.length} possibilités`
              : undefined
          }
        />
        {isExpanded && category.options && (
          <FlatList
            data={category.options}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ paddingLeft: 32 }}>
                <Text>{item.value}</Text>
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
