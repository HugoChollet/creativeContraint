import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 1, type: 'Book' } })}>
        <Text>Write a Fiction Book</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 2, type: 'Video Game' } })}>
        <Text>Develop a Video Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'Music' } })}>
        <Text>Compose a song</Text>
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
