import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';


interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // This allows any result content
  buttonText?: string;
}

export function BottomSheet({ isVisible, onClose, title, children, buttonText = "Close" }: BottomSheetProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Transparent area to click and close */}
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    minHeight: '40%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  contentScroll: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});