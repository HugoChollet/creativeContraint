import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
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

  const handleCycleMode = () => {
    const modes: PresetMode[] = ['none', 'easy', 'hard', 'all'];
    const currentIndex = modes.indexOf(mode === 'custom' ? 'none' : mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setMode(nextMode);
    // We pass a helper function via props to the parent to update the IDs
    onBulkUpdate(category.category, category.options, nextMode);
  };

  // When a manual checkbox is clicked
  const handleManualToggle = (id: number) => {
    setMode('custom');
    onToggleOption(category.category, id);
  };

  return (
    <View style={[styles.card, !isEnabled && styles.cardDisabled]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => onToggleCategory(category.category)}>
          <Ionicons 
            name={isEnabled ? "checkbox" : "square-outline"} 
            size={24} 
            color={isEnabled ? "#007AFF" : "#999"} 
          />
        </Pressable>

        <Pressable 
          onPress={handleToggleExpand} 
          style={styles.titleArea} 
          disabled={!isEnabled}
        >
          <Text style={[styles.headerText, !isEnabled && styles.textDisabled]}>
            {category.category}
          </Text>
        </Pressable>

        <Pressable onPress={handleToggleExpand} disabled={!isEnabled}>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={isEnabled ? "#666" : "#ddd"} 
          />
        </Pressable>
      </View>

      {isExpanded && isEnabled && (
        <View style={styles.divider}>
          <View style={{ marginRight: 10 }}>
            <StatusSelector 
              currentMode={mode} 
              onSelect={(newMode) => {
                setMode(newMode);
                onBulkUpdate(category.category, category.options, newMode);
              }} 
            />
          </View>
          {category.options.map((opt: Option) => (
            <ConstraintOption 
              key={opt.id}
              option={opt}
              isParentEnabled={isEnabled}
              isSelected={!!selectedItems.selectedOptions[`${category.category}-${opt.id}`]}
              onToggle={(id) => handleManualToggle(id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden',  borderColor: '#eee' },
  cardDisabled: { backgroundColor: '#f9f9f9', borderColor: '#eee' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  titleArea: { flex: 1, marginLeft: 12 },
  headerText: { fontSize: 17, fontWeight: '700' },
  textDisabled: { color: '#bbb' },
  divider: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingBottom: 8 }
});