import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Category, Option, SelectedState } from '../types/constraints';
import { ConstraintOption } from './constraint-option';
import { PresetMode, StatusSelector } from './ui/status-selector';

interface CategoryProps {
  category: Category;
  selectedItems: SelectedState;
  onToggleCategory: (name: string) => void;
  onToggleOption: (catName: string, id: number) => void;
  onBulkUpdate: (catName: string, options: Option[], mode: PresetMode) => void;
}

export default function CategorySelector({ category, selectedItems, onToggleCategory, onToggleOption, onBulkUpdate }: CategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isEnabled = !!selectedItems.activeCategories[category.category];

  const handleToggleExpand = () => {
    if (!isEnabled) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const [mode, setMode] = useState<PresetMode>('all'); // Default to 'all' based on your previous init

return (
    <View style={[
      styles.card, 
      !isEnabled && styles.cardDisabled,
      isExpanded && { height: 400 } // Set a fixed height when expanded to allow internal scroll
    ]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => onToggleCategory(category.category)}>
          <Ionicons 
            name={isEnabled ? "checkbox" : "square-outline"} 
            size={24} 
            color={isEnabled ? "#007AFF" : "#999"} 
          />
        </Pressable>

        <Pressable onPress={handleToggleExpand} style={styles.titleArea} disabled={!isEnabled}>
          <Text style={[styles.headerText, !isEnabled && styles.textDisabled]}>
            {category.category}
          </Text>
        </Pressable>

        <Pressable onPress={handleToggleExpand} disabled={!isEnabled}>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isEnabled ? "#666" : "#ddd"} />
        </Pressable>
      </View>

      {isExpanded && isEnabled && (
        <View style={styles.expandedContent}>
          <View style={styles.fixedSelectorWrapper}>
            <StatusSelector 
              currentMode={mode} 
              onSelect={(newMode) => {
                setMode(newMode);
                onBulkUpdate(category.category, category.options, newMode);
              }} 
            />
          </View>
          <ScrollView 
            style={styles.optionsScrollView}
            nestedScrollEnabled={true} // Crucial for Android support
          >
            {category.options.map((opt: Option) => (
              <ConstraintOption 
                key={opt.id}
                option={opt}
                isParentEnabled={isEnabled}
                isSelected={!!selectedItems.selectedOptions[`${category.category}-${opt.id}`]}
                onToggle={(id) => {
                  setMode('custom');
                  onToggleOption(category.category, id);
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 12, 
    overflow: 'hidden', 
    borderColor: '#eee',
    borderWidth: 1 
  },
  cardDisabled: { backgroundColor: '#f9f9f9', opacity: 0.8 },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    zIndex: 10, // Ensure header stays on top
    backgroundColor: '#fff'
  },
  titleArea: { flex: 1, marginLeft: 12 },
  headerText: { fontSize: 17, fontWeight: '700' },
  textDisabled: { color: '#bbb' },
  
  expandedContent: {
    flex: 1, // Takes up remaining space in the 400px card
  },
  fixedSelectorWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  optionsScrollView: {
    flex: 1, // This allows the list to scroll inside the fixed-height card
  },
  divider: { 
    paddingBottom: 8 
  }
});