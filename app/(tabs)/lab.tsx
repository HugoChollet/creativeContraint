import book from '@/assets/book.json';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BookConstraints = {
    genre: number;
    theme: number;
    format: number;
}

export default function DetailsScreen() {
  const { id } = useLocalSearchParams(); // Access passed ID
  const [ randomConstraint, setRandomConstraint ] = useState<BookConstraints>({ genre: 0, theme: 0, format: 0 });

  function RefreshConstraint() {
    console.log('Refresh');
    setRandomConstraint({ genre: Math.floor(Math.random() * book.constraints[0].options.length), theme: Math.floor(Math.random() * book.constraints[1].options.length), format: Math.floor(Math.random() * book.constraints[2].options.length) });
  }

  return (
    <View style={styles.container}>
        <ThemedText type="title">Lab for { id }</ThemedText>
        <ThemedText type="subtitle">{book.constraints[0].category}</ThemedText>
        <ThemedText>{book.constraints[0].options[randomConstraint.genre].value}</ThemedText>
        <ThemedText type="subtitle">{book.constraints[1].category}</ThemedText>
        <ThemedText>{book.constraints[1].options[randomConstraint.theme].value}</ThemedText>
        <ThemedText type="subtitle">{book.constraints[2].category}</ThemedText>
        <ThemedText>{book.constraints[2].options[randomConstraint.format].value}</ThemedText>
            <TouchableOpacity style={styles.button} onPress={RefreshConstraint}>
                <Text>Refresh</Text>
            </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', color: 'white' },

    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
    },
});