import { Text, TouchableOpacity, View } from "react-native";
import { useStyles } from "../../hooks/use-styles";

export function ThemeSwitcher() {
  const { globalStyles, colors, setThemeMode, themeMode } = useStyles();

  const options: { label: string; value: "light" | "dark" | "system" }[] = [
    { label: "☀️ Light", value: "light" },
    { label: "🌙 Dark", value: "dark" },
    { label: "⚙️ System", value: "system" },
  ];

  return (
    <>
      <Text style={globalStyles.title}>Appearance</Text>
      <View style={globalStyles.shadeContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setThemeMode(opt.value)}
            style={[
              globalStyles.secondaryButton,
              {
                backgroundColor:
                  themeMode === opt.value ? colors.tint : "transparent",
                borderWidth: 1,
                borderColor: colors.tint,
              },
            ]}
          >
            <Text
              style={{
                color:
                  themeMode === opt.value ? colors.invertedText : colors.text,
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
