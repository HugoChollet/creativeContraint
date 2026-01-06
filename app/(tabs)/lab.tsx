import book from '@/assets/book.json';
import music from '@/assets/music.json';
import CategorySelector from '@/components/category-selector';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PresetMode } from '@/components/ui/status-selector';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Option, SelectedState } from '../../types/constraints';

export type GeneratedConstraints = Record<string, string>;

export default function DetailsScreen() {
  const { id, type } = useLocalSearchParams(); 
  const [modalVisible, setModalVisible] = useState(false);
  const [randomConstraints, setRandomConstraints] = useState<GeneratedConstraints>({});

  const dataSource = type === 'Music' ? music : book;

// Helper to build initial state where everything is ON
  const getInitialState = (): SelectedState => {
    const activeCats: Record<string, boolean> = {};
    const selOpts: Record<string, boolean> = {};

    dataSource.constraints.forEach((cat) => {
      // Enable the category by default
      activeCats[cat.category] = true;
      
      if (cat.options) {
        // Enable every option by default
        cat.options.forEach((opt) => {
          selOpts[`${cat.category}-${opt.id}`] = true;
        });
      } else if (cat.sub_categories) {
        // Enable every subcategory by default
        cat.sub_categories.forEach((subCat) => {
          subCat.options.forEach((opt) => {
            selOpts[`${cat.category}-${subCat.name}-${opt.id}`] = true;
          });
        });
      }
    });

    return {
      activeCategories: activeCats,
      selectedOptions: selOpts,
    };
  };

  const [selectedItems, setSelectedItems] = useState<SelectedState>(getInitialState);

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
        const availableOptions = cat.options ? cat.options.filter(
          opt => selectedItems.selectedOptions[`${cat.category}-${opt.id}`]
        ) : cat.sub_categories ? cat.sub_categories.flatMap(subCat => subCat.options.filter(
          opt => selectedItems.selectedOptions[`${cat.category}-${subCat.name}-${opt.id}`]
        )) : [];

        if (availableOptions.length > 0) {
          results[cat.category] = '';
          if (cat.options) {
            const randomIndex = Math.floor(Math.random() * availableOptions.length);
            results[cat.category] = availableOptions[randomIndex].value;
          } else if (cat.sub_categories) { // Concat all subCat result to result
            for (const subCat of cat.sub_categories) {
              const randomIndex = Math.floor(Math.random() * subCat.options.length);
              results[cat.category] += ' ' + subCat.options[randomIndex].value;
            }
          }
        }
      }
    });

    setRandomConstraints(results);
    setModalVisible(true);
  }


  const bulkUpdateOptions = (categoryName: string, options: Option[], mode: PresetMode) => {
    setSelectedItems(prev => {
      const newOptions = { ...prev.selectedOptions };
      
      options.forEach(opt => {
        const key = `${categoryName}-${opt.id}`;
        if (mode === 'all') newOptions[key] = true;
        else if (mode === 'none') newOptions[key] = false;
        else if (mode === 'easy') newOptions[key] = opt.rarity <= 2;
        else if (mode === 'hard') newOptions[key] = opt.rarity >= 3;
        // 'custom' does nothing in bulk; it's handled by manual clicks
      });

      return { ...prev, selectedOptions: newOptions };
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title} type="title">{dataSource.project_type} Lab</ThemedText>
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {dataSource.constraints.map((cat) => (
          <CategorySelector 
            key={cat.category}
            category={cat}
            selectedItems={selectedItems}
            onToggleCategory={toggleCategory}
            onToggleOption={toggleOption}
            onBulkUpdate={bulkUpdateOptions}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.showResultButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>A</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={refreshConstraints}>
        <Text style={styles.buttonText}>Generate {dataSource.project_type} Idea</Text>
      </TouchableOpacity>

      <BottomSheet 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)}
        title={`${dataSource.project_type} Constraints`}
        buttonText="Back to Lab"
      >
        {/* Everything here is passed as 'children' */}
        {dataSource.constraints.map((cat) => {
          return (
            <View key={cat.category} style={styles.modalResultBox}>
              <Text style={styles.modalCategoryLabel}>{cat.category}</Text>
              <Text style={styles.modalValueText}>{randomConstraints[cat.category] ?? "-"}</Text>
            </View>
          );
        })}
      </BottomSheet>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme to match ThemedText
  },
  title: {
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 32,
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
  showResultButton: {
    position: 'absolute',
    bottom: 64,
    alignSelf: 'center',
    backgroundColor: '#767676ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 32,
    borderRadius: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalResultBox: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalCategoryLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalValueText: {
    color: '#0A84FF', // Brighter blue for high contrast
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
});