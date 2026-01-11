
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const containerLight = 'rgba(205, 205, 205, 1)';
const containerDark = '#333';

export const Themes = {
  light: {
    text: '#11181C',
    background: '#fff',
    container: containerLight,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    placeholder: '#979797ff',
    borderColor: containerLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    container: containerDark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    placeholder: '#555555ff',
    borderColor: containerDark,
  },
} as const; // 'as const' makes the types exact strings rather than just 'string'

export const Colors = {
  alert: '#ff4444',
};

// Types for your theme
export type AppTheme = keyof typeof Themes; // 'light' | 'dark'
export type AppThemeColors = typeof Themes.light | typeof Themes.dark; // The structure of the color object