import { CategorySectionData } from "@/app/(tabs)/category-browse";
import { useStyles } from "@/hooks/use-styles";
import { Category } from "@/types/category";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Text, View } from "react-native";
import CategoryItem from "./category-item";

interface CategorySectionProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
  onPublish?: (cat: Category) => void;
  projectColor: string;
  section: CategorySectionData;
}

export default function CategorySection({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  projectColor,
  section,
}: CategorySectionProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleExpand = (categoryName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) =>
      prev === categoryName ? null : categoryName,
    );
    console.log("toggle ", categoryName);
  };

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
        section.data.map((cat) => (
          <CategoryItem
            key={cat.id}
            onDelete={onDelete}
            onEdit={onEdit}
            onFork={onFork}
            onPublish={() => {
              console.log("publish ", cat.name);
              if (onPublish) onPublish(cat);
            }}
            projectColor={projectColor}
            category={cat}
            expanded={expandedCategory === cat.name}
            toggleExpand={() => handleToggleExpand(cat.name)}
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
