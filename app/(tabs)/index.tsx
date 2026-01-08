import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 1, type: 'book' } })}>
        <Text style={styles.buttonText}>{t('common:home.book_button')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 2, type: 'videoGame' } })}>
        <Text style={styles.buttonText}>{t('common:home.videogame_button')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'music' } })}>
        <Text style={styles.buttonText}>{t('common:home.music_button')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'videoInternet' } })}>
        <Text style={styles.buttonText}>{t('common:home.videointernet_button')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'videoFiction' } })}>
        <Text style={styles.buttonText}>{t('common:home.videofiction_button')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/lab', params: { id: 3, type: 'photography' } })}>
        <Text style={styles.buttonText}>{t('common:home.photography_button')}</Text>
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
