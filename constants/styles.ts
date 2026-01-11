import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { AppThemeColors, Colors } from './theme';

// Define an interface for your shared styles
interface GlobalStyles {
  input: ViewStyle & TextStyle;
  button: ViewStyle;
  alertButton: ViewStyle;
  alertText: TextStyle;
}

export const getGlobalStyles = (colors: AppThemeColors): GlobalStyles => 
  StyleSheet.create({
    input: {
      backgroundColor: colors.background === '#fff' ? '#F0F0F0' : '#1A1A1A',
      height: 56,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.tint,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    alertButton: {
        borderWidth: 1,
        borderColor: Colors.alert,
        backgroundColor: 'transparent',
    },
    alertText: {
        color: Colors.alert,
        fontSize: 16,
        fontWeight: '600',
    }
  });