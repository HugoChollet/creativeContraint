import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams(); // Access passed ID

  return (
    <View style={styles.container}>
      <ThemedText type="title">Lab for { id }</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', color: 'white' },
});