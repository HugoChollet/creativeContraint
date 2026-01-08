import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 1, type: 'Book' } })}>
        <Text style={styles.buttonText}>Write a Fiction Book 📖</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 2, type: 'Video Game' } })}>
        <Text style={styles.buttonText}>Develop a Video Game 🎮</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'Music' } })}>
        <Text style={styles.buttonText}>Compose a song 🎵</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'Internet Video' } })}>
        <Text style={styles.buttonText}>Create Video Content 🌐</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'videoFiction' } })}>
        <Text style={styles.buttonText}>Film a Fiction 🎞️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'phototography' } })}>
        <Text style={styles.buttonText}>Take a Photography 📷</Text>
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
