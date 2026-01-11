import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { AppThemeColors, Colors } from './theme';

// Define an interface for your shared styles
interface GlobalStyles {
  input: ViewStyle & TextStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
  transparentButton: ViewStyle;
  transparentButtonText: TextStyle;
  alertButton: ViewStyle;
  alertText: TextStyle;
}

export const getGlobalStyles = (themes: AppThemeColors): GlobalStyles => {

  const baseButton: ViewStyle = {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  };
  const baseButtonText: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
  }

  return StyleSheet.create({
    input: {
      backgroundColor: themes.background === '#fff' ? '#F0F0F0' : '#1A1A1A',
      height: 56,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: themes.borderColor,
      color: themes.text,
    },
    secondaryButton: {
      ...baseButton,
      backgroundColor: themes.tint,
    },
    secondaryButtonText: {
      ...baseButtonText,
      color: themes.background,
    },
    transparentButton: {
      ...baseButton,
      borderWidth: 1,
      borderColor: themes.borderColor,
      backgroundColor: 'transparent',
    },
    transparentButtonText: {
      ...baseButtonText,
      color: themes.text,
    },
    alertButton: {
      ...baseButton,
        borderWidth: 1,
        borderColor: Colors.alert,
        backgroundColor: 'transparent',
    },
    alertText: {
      ...baseButtonText,
        color: Colors.alert,
    }
  });
}