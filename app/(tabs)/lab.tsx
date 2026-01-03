import book from '@/assets/book.json';
import music from '@/assets/music.json';
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
  const { id, type } = useLocalSearchParams(); 
  
  // 1. Determine which data to use based on 'type' prop or param
  const dataSource = type === 'Music' ? music : book;

// Helper to build initial state where everything is ON
  const getInitialState = (): SelectedState => {
    const activeCats: Record<string, boolean> = {};
    const selOpts: Record<string, boolean> = {};

    dataSource.constraints.forEach((cat) => {
      // Enable the category by default
      activeCats[cat.category] = true;
      
      // Enable every option by default
      cat.options.forEach((opt) => {
        selOpts[`${cat.category}-${opt.id}`] = true;
      });
    });

    return {
      activeCategories: activeCats,
      selectedOptions: selOpts,
    };
  };

  // Initialize state with the helper
  const [selectedItems, setSelectedItems] = useState<SelectedState>(getInitialState);

  // 2. State now stores Category Name -> Option Index
  const [randomConstraints, setRandomConstraints] = useState<GeneratedConstraints>({});

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

  // 3. The Generic Refresh Logic
  function refreshConstraints() {
    const results: GeneratedConstraints = {};

    dataSource.constraints.forEach((cat) => {
      if (selectedItems.activeCategories[cat.category]) {
        const availableOptions = cat.options.filter(
          opt => selectedItems.selectedOptions[`${cat.category}-${opt.id}`]
        );

        if (availableOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableOptions.length);
          const selectedId = availableOptions[randomIndex].id;
          
          // Store the index of the selected ID within the original options array
          results[cat.category] = cat.options.findIndex(o => o.id === selectedId);
        }
      }
    });

    setRandomConstraints(results);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="title">{dataSource.project_type} Lab</ThemedText>
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {dataSource.constraints.map((cat) => (
          <Category 
            key={cat.category}
            category={cat}
            selectedItems={selectedItems}
            onToggleCategory={toggleCategory}
            onToggleOption={toggleOption}
          />
        ))}
      </ScrollView>

      {/* 4. Generic Results Display */}
      <View style={styles.resultsContainer}>
        {dataSource.constraints.map((cat) => {
          const isEnabled = selectedItems.activeCategories[cat.category];
          const resultIdx = randomConstraints[cat.category];
          const hasResult = resultIdx !== undefined;

          if (!isEnabled) return null; // Don't even show the label if category is off

          return (
            <View key={cat.category} style={styles.resultBox}>
              <ThemedText type="subtitle" style={styles.dimText}>{cat.category}</ThemedText>
              <ThemedText style={styles.resultValue}>
                {hasResult ? cat.options[resultIdx].value : "Select options above..."}
              </ThemedText>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={refreshConstraints}>
        <Text style={styles.buttonText}>Generate {dataSource.project_type} Idea</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme to match ThemedText
  },
  scroll: {
    flex: 0.6, // Gives the list area most of the space
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  resultsContainer: {
    flex: 0.4, // Area for the generated output
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    // Add shadow/elevation for a "floating sheet" look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  resultBox: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  dimText: {
    color: '#888',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    color: '#007AFF', // Vibrant blue for the actual constraint
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});