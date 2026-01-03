import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Option } from '../types/constraints';

interface OptionProps {
  option: Option;
  isSelected: boolean;
  isParentEnabled: boolean;
  onToggle: (id: number) => void;
}

export function ConstraintOption({ option, isSelected, isParentEnabled, onToggle }: OptionProps) {
  return (
    <Pressable 
      style={styles.optionRow} 
      onPress={() => onToggle(option.id)}
      disabled={!isParentEnabled}
    >
      <Ionicons 
        name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
        size={22} 
        color={!isParentEnabled ? "#ddd" : isSelected ? "#007AFF" : "#ccc"} 
      />
      <View style={styles.textContainer}>
        <Text style={[styles.optionValue, (!isSelected || !isParentEnabled) && styles.textDisabled]}>
          {option.value}
        </Text>
        <Text style={styles.rarityLabel}>Rarity: {option.rarity}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  textContainer: { marginLeft: 12 },
  optionValue: { fontSize: 16, color: '#333' },
  textDisabled: { color: '#aaa' },
  rarityLabel: { fontSize: 11, color: '#bbb', marginTop: 2 }
});