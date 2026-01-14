import { getGlobalStyles } from '../constants/styles';
import { useTheme } from '../contexts/theme-context';

export function useStyles() {
  const { colors, resolvedTheme, setThemeMode, themeMode } = useTheme();
  
  const globalStyles = getGlobalStyles(colors);

  return { 
    globalStyles, 
    colors, 
    theme: resolvedTheme, // 'light' | 'dark'
    themeMode,            // 'light' | 'dark' | 'system'
    setThemeMode          // Function to change it
  };
}