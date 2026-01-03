import { Category, SelectedState } from '@/types/constraints';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  category: Category;
  selectedItems: SelectedState;
  onToggle: (catName: string, id: number) => void;
}

export default function CategoryComponent({ category, selectedItems, onToggle }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.card}>

      <Pressable onPress={handleToggleExpand} style={styles.header}>
        <Text style={styles.headerText}>{category.category}</Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.optionsList}>
          {category.options.map((opt) => {
            const isSelected = !!selectedItems[`${category.category}-${opt.id}`];
            
            return (
              <Pressable 
                key={opt.id} 
                style={styles.optionRow}
                onPress={() => onToggle(category.category, opt.id)}
              >
                <Ionicons 
                  name={isSelected ? "checkbox" : "square-outline"} 
                  size={22} 
                  color={isSelected ? "#007AFF" : "#ccc"} 
                />
                <View style={styles.labelContainer}>
                  <Text style={[styles.optionValue, !isSelected && styles.disabledText]}>
                    {opt.value}
                  </Text>
                  <Text style={styles.rarityLabel}>Rarity: {opt.rarity}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  headerText: { fontSize: 18, fontWeight: '600' },
  optionsList: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16 },
  labelContainer: { marginLeft: 12, flex: 1 },
  optionValue: { fontSize: 16, color: '#333' },
  disabledText: { color: '#aaa' },
  rarityLabel: { fontSize: 12, color: '#999', marginTop: 2 }
});