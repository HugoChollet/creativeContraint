import { useStyles } from "@/hooks/use-styles";
import { Category, CategorySectionData } from "@/types/category";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Text, View } from "react-native";
import CategoryItem from "./category-item";

interface CategorySectionProps {
  onDelete?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onFork?: (category: Category) => void;
  onPublish?: (cat: Category) => void;
  onToggleCategory: (category: Category) => void;
  projectColor: string;
  section: CategorySectionData;
}

export default function CategorySection({
  onDelete,
  onEdit,
  onFork,
  onPublish,
  onToggleCategory,
  projectColor,
  section,
}: CategorySectionProps) {
  const { globalStyles, colors } = useStyles();
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleExpand = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
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
            onPublish={() => onPublish?.(cat)}
            projectColor={projectColor}
            category={cat}
            selected={section.selected.includes(cat.id)}
            onToggleCategory={onToggleCategory}
            expanded={expandedCategory === cat.id}
            toggleExpand={() => handleToggleExpand(cat.id)}
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
