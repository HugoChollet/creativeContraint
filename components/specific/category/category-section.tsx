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
    <>
      {/* <View
      style={[
        globalStyles.card,
        !isEnabled && { borderColor: colors.disable },
        isExpanded && { height: 500 }, // Increased height to accommodate tabs
      ]}
    >
      <Pressable onPress={handleToggleExpand} style={globalStyles.headerRow}>
        <Pressable
          onPress={() => {
            onToggleCategory(category.name);
            if (isExpanded) handleToggleExpand();
          }}
        >
          <Ionicons
            name={isEnabled ? "checkbox" : "square-outline"}
            size={24}
            color={isEnabled ? color : colors.textDiscreet}
          />
        </Pressable>

        <View style={globalStyles.titleArea}>
          <View style={globalStyles.elementAndDescriptorContainer}>
            <Text
              style={[
                globalStyles.text,
                { color: isEnabled ? colors.text : colors.textDiscreet },
              ]}
            >
              {category.label || category.name}
            </Text>
            {category.description && (
              <Tooltip
                title={category.label || category.name}
                description={category.description}
                color={color}
              />
            )}
          </View>
          <Text
            style={[
              globalStyles.discreetText,
              { color: isEnabled ? colors.textDiscreet : colors.disable },
            ]}
          >
            {t("component:status." + mode)}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={isEnabled ? colors.textDiscreet : colors.disable}
        />
      </Pressable>

      {isExpanded && isEnabled && (
        <View style={styles.expandedContent}>

          <ScrollView nestedScrollEnabled={true}>
            {currentOptions
              .sort((a, b) => a.value.localeCompare(b.value))
              .map((opt: Option) => {
                // Create a unique key for selection state: "Category-SubName-ID" or "Category-ID"
                const selectionKey = `${category.name}-${opt.id}`;

                return (
                  <ConstraintSelector
                    key={opt.id}
                    option={opt}
                    isParentEnabled={isEnabled}
                    isSelected={!!selectedItems.selectedOptions[selectionKey]}
                    color={color}
                    onToggle={(id) => {
                      setMode("custom");
                      // Pass the specialized key to the parent handler
                      const fullKey = hasSubCategories
                        ? `${category.name}-${currentSubCategory?.name}`
                        : category.name;
                      onToggleOption(fullKey, id);
                    }}
                  />
                );
              })}
          </ScrollView>
        </View>
      )}
    </View> */}
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
    </>
  );
}
