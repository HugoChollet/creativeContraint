import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type PresetMode = 'none' | 'easy' | 'custom' | 'hard' | 'all';

interface StatusSelectorProps {
  currentMode: PresetMode;
  onSelect: (mode: PresetMode) => void;
  disabled?: boolean;
}

const MODES: { id: PresetMode; label: string; color: string }[] = [
  { id: 'none', label: 'None', color: '#8E8E93' },
  { id: 'easy', label: 'Easy', color: '#34C759' },
  { id: 'custom', label: 'Custom', color: '#007AFF' },
  { id: 'hard', label: 'Hard', color: '#FF3B30' },
  { id: 'all', label: 'All', color: '#000000' },
];

export function StatusSelector({ currentMode, onSelect, disabled }: StatusSelectorProps) {
  return (
    <View style={[styles.container, disabled && { opacity: 0.5 }]}>
      {MODES.map((mode) => {
        const isActive = currentMode === mode.id;
        
        return (
          <Pressable
            key={mode.id}
            disabled={disabled}
            onPress={() => onSelect(mode.id)}
            style={({ pressed }) => [
              styles.segment,
              { 
                // Background is full color if active, very pale if not
                backgroundColor: isActive ? mode.color : `${mode.color}15`, 
                borderColor: isActive ? mode.color : 'transparent',
                transform: [{ scale: pressed ? 0.96 : 1 }]
              }
            ]}
          >
            <Text style={[
              styles.label, 
              { color: isActive ? '#fff' : mode.color }
            ]}>
              {mode.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginTop: 10,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});