import { CategorySectionData } from "@/app/(tabs)/category-browse";
import { useStyles } from "@/hooks/use-styles";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import CategoryCrud from "./category-crud";

interface CategorySectionProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  projectColor: string;
  section: CategorySectionData;
}

export default function CategorySection({
  onDelete,
  onEdit,
  onFork,
  projectColor,
  section,
}: CategorySectionProps) {
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
            onDelete={onDelete}
            onEdit={onEdit}
            onFork={onFork}
            projectColor={projectColor}
            category={item}
            expand={false}
            setExpand={() => {}}
            type={section.title}
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
