import { useColorScheme } from 'react-native';
import { getGlobalStyles } from '../constants/styles';
import { AppThemeColors, Themes } from '../constants/theme';

export function useStyles() {
  const systemTheme = useColorScheme() ?? 'light';
  const colors: AppThemeColors = Themes[systemTheme];
  
  const globalStyles = getGlobalStyles(colors);

  return { globalStyles, colors, theme: systemTheme };
}