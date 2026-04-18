import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { Text, View } from "react-native";
import Crud from "../../generic/crud";
import Tooltip from "../../generic/tooltip";

interface CategoryCrudProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  projectColor: string;
  category: Category;
}

export default function CategoryCrud({
  onDelete,
  onEdit,
  onFork,
  projectColor,
  category,
}: CategoryCrudProps) {
  const { globalStyles, colors } = useStyles();

  return (
    <>
      <View
        style={[
          globalStyles.optionItem,
          { justifyContent: "space-between", padding: 4 },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <View>
            <Text
              style={{
                color: colors.text,
              }}
            >
              {category.name}
            </Text>
          </View>
          {!!category.description && (
            <Tooltip
              title={category.name}
              description={category.description}
              color={projectColor}
            />
          )}
        </View>
        <Crud
          onDelete={onDelete}
          onEdit={onEdit}
          onFork={onFork}
          color={projectColor}
        />
      </View>
    </>
  );
}
