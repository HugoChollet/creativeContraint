import { ThemedView } from '@/components/themed-view';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Pressed')}>
        <Text>Fiction Book</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Pressed')}>
        <Text>Video Game</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 24,
  },
    button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
});
