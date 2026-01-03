import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { Category, SelectedState } from '../types/constraints';

interface Props {
  category: Category;
  selectedItems: SelectedState;
  onToggleCategory: (name: string) => void;
  onToggleOption: (catName: string, id: number) => void;
}

export default function CategoryComponent({ category, selectedItems, onToggleCategory, onToggleOption }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if this specific category is enabled
  const isCategoryEnabled = !!selectedItems.activeCategories[category.category];

  const handleToggleExpand = () => {
    // Only allow expanding if the category is enabled
    if (!isCategoryEnabled) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.card, !isCategoryEnabled && styles.cardDisabled]}>
      <View style={styles.headerRow}>
        
        {/* 1. Left: Master Checkbox */}
        <Pressable onPress={() => onToggleCategory(category.category)} style={styles.checkbox}>
          <Ionicons 
            name={isCategoryEnabled ? "checkbox" : "square-outline"} 
            size={24} 
            color={isCategoryEnabled ? "#007AFF" : "#999"} 
          />
        </Pressable>

        {/* 2. Center: Category Name (Clicking this also toggles dropdown) */}
        <Pressable 
          onPress={handleToggleExpand} 
          style={styles.titlePressable}
          disabled={!isCategoryEnabled}
        >
          <Text style={[styles.headerText, !isCategoryEnabled && styles.textDisabled]}>
            {category.category}
          </Text>
        </Pressable>

        {/* 3. Right: Arrow Icon */}
        <Pressable 
          onPress={handleToggleExpand} 
          disabled={!isCategoryEnabled}
          style={styles.arrow}
        >
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={isCategoryEnabled ? "#666" : "#ccc"} 
          />
        </Pressable>
      </View>

      {/* Options List: Only visible if expanded AND enabled */}
      {isExpanded && isCategoryEnabled && (
        <View style={styles.optionsList}>
          {category.options.map((opt) => {
            const isSelected = !!selectedItems.selectedOptions[`${category.category}-${opt.id}`];
            return (
              <Pressable 
                key={opt.id} 
                style={styles.optionRow}
                onPress={() => onToggleOption(category.category, opt.id)}
              >
                <Ionicons 
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={isSelected ? "#007AFF" : "#ccc"} 
                />
                <Text style={[styles.optionValue, !isSelected && styles.textDisabled]}>
                  {opt.value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  cardDisabled: { backgroundColor: '#f0f0f0', borderColor: '#ddd' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  checkbox: { marginRight: 12 },
  titlePressable: { flex: 1 },
  headerText: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  textDisabled: { color: '#aaa' },
  arrow: { paddingLeft: 10 },
  optionsList: { borderTopWidth: 1, borderTopColor: '#e0e0e0', backgroundColor: '#fff' },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 20 },
  optionValue: { fontSize: 15, marginLeft: 10, color: '#333' },
});