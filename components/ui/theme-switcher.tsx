import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../../hooks/use-styles';

export function ThemeSwitcher() {
  const { globalStyles, colors, setThemeMode, themeMode } = useStyles();

  const options: { label: string; value: 'light' | 'dark' | 'system' }[] = [
    { label: '☀️ Light', value: 'light' },
    { label: '🌙 Dark', value: 'dark' },
    { label: '⚙️ System', value: 'system' },
  ];

  return (
    <View style={{ padding: 20, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, marginBottom: 10, fontWeight: 'bold' }}>
        Appearance
      </Text>
      
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => setThemeMode(opt.value)}
          style={[
            globalStyles.secondaryButton,
            { 
              backgroundColor: themeMode === opt.value ? colors.tint : 'transparent',
              borderWidth: 1,
              borderColor: colors.tint 
            }
          ]}
        >
          <Text style={{ color: themeMode === opt.value ? '#fff' : colors.text }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}