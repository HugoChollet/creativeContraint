import book from '@/assets/book.json';
import Category from '@/components/category-component';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SelectedState } from '../../types/constraints';

type BookConstraints = {
    genre: number;
    theme: number;
    format: number;
}

export type GeneratedConstraints = Record<string, number>;

export default function DetailsScreen() {
  const { id } = useLocalSearchParams(); // Access passed ID
  const [ randomConstraint, setRandomConstraint ] = useState<BookConstraints>({ genre: 0, theme: 0, format: 0 });
  const [selectedItems, setSelectedItems] = useState<SelectedState>({
    activeCategories: {},
    selectedOptions: {}
  });

  const toggleCategory = (name: string) => {
    setSelectedItems(prev => ({
      ...prev,
      activeCategories: { ...prev.activeCategories, [name]: !prev.activeCategories[name] }
    }));
  };

  const toggleOption = (catName: string, id: number) => {
    const key = `${catName}-${id}`;
    setSelectedItems(prev => ({
      ...prev,
      selectedOptions: { ...prev.selectedOptions, [key]: !prev.selectedOptions[key] }
    }));
  };

  function RefreshConstraint() {
    const newConstraints = { ...randomConstraint };

    book.constraints.forEach((cat, index) => {
      const isCatActive = selectedItems.activeCategories[cat.category];
      
      if (isCatActive) {
        // Find which options the user checked for THIS category
        const availableOptions = cat.options.filter(
          opt => selectedItems.selectedOptions[`${cat.category}-${opt.id}`]
        );

        if (availableOptions.length > 0) {
          // Pick a random ID from the available filtered list
          const randomIndex = Math.floor(Math.random() * availableOptions.length);
          const selectedId = availableOptions[randomIndex].id;
          
          // Map back to the index in the original book.json so the UI updates
          const originalIndex = cat.options.findIndex(o => o.id === selectedId);
          
          if (index === 0) newConstraints.genre = originalIndex;
          if (index === 1) newConstraints.theme = originalIndex;
          if (index === 2) newConstraints.format = originalIndex;
        }
      }
    });

    setRandomConstraint(newConstraints);
  };

  const renderResult = (catIndex: number, constraintIndex: number) => {
    const cat = book.constraints[catIndex];
    const isCatActive = selectedItems.activeCategories[cat.category];
    const hasOptions = cat.options.some(opt => selectedItems.selectedOptions[`${cat.category}-${opt.id}`]);

    if (!isCatActive) return "Category disabled";
    if (!hasOptions) return "Select at least one option above";
    
    return cat.options[constraintIndex].value;
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Lab for { id }</ThemedText>

      <ScrollView contentContainerStyle={styles.content}>        
        {book.constraints.map((cat) => (
          <Category 
            key={cat.category}
            category={cat}
            selectedItems={selectedItems}
            onToggleCategory={toggleCategory}
            onToggleOption={toggleOption}
          />
        ))}

        <View style={styles.resultsContainer}>
          {book.constraints.map((cat, idx) => (
            <View key={cat.category} style={styles.resultBox}>
              <ThemedText type="subtitle">{cat.category}</ThemedText>
              <ThemedText style={styles.resultValue}>
                {renderResult(idx, idx === 0 ? randomConstraint.genre : idx === 1 ? randomConstraint.theme : randomConstraint.format)}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>


      <TouchableOpacity style={styles.button} onPress={RefreshConstraint}>
          <Text style={styles.buttonText}>🎲 Generate Random Constraints</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' }, // Dark background for 'ThemedText'
    content: { padding: 16 },
    resultsContainer: {
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        margin: 16,
        width: '90%',
    },
    resultBox: { marginBottom: 15 },
    resultValue: { fontSize: 18, color: '#007AFF', fontWeight: '600' },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        margin: 20,
        alignItems: 'center'
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});