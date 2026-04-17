import { CategorySection } from "@/app/(tabs)/category-browse";
import { useStyles } from "@/hooks/use-styles";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import CategoryCrud from "./category-crud";

interface CategoryItemProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  projectColor: string;
  section: CategorySection;
}

export default function CategoryItem({
  onDelete,
  onEdit,
  onFork,
  projectColor,
  section,
}: CategoryItemProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={[
          globalStyles.subtitle,
          { color: colors.text, marginBottom: 12 },
        ]}
      >
        {section.title}
      </Text>
      {section.data.length > 0 ? (
        section.data.map((item) => (
          <CategoryCrud
            key={item.id}
            category={item}
            onDelete={
              section.title === t("screen:category_browse.personal_section")
                ? () => {}
                : undefined
            }
            onFork={
              section.title !== t("screen:category_browse.personal_section")
                ? () => {}
                : undefined
            }
            onEdit={
              section.title === t("screen:category_browse.personal_section")
                ? () => {}
                : undefined
            }
            projectColor={projectColor}
          />
        ))
      ) : (
        <Text style={{ color: colors.placeholder }}>
          {t("screen:category_browse.no_categories")}
        </Text>
      )}
    </View>
  );
}
