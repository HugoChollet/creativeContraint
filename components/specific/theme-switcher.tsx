import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { useStyles } from "../../hooks/use-styles";

export function ThemeSwitcher() {
  const { globalStyles, colors, setThemeMode, themeMode } = useStyles();
  const { t } = useTranslation();

  const options: { label: string; value: "light" | "dark" | "system" }[] = [
    { label: "☀️ " + t("component:theme-switcher.light"), value: "light" },
    { label: "🌙 " + t("component:theme-switcher.dark"), value: "dark" },
    { label: "⚙️ " + t("component:theme-switcher.system"), value: "system" },
  ];

  return (
    <>
      <Text style={globalStyles.subtitle}>
        {t("component:theme-switcher.title")}
      </Text>
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
                  themeMode === "light" && themeMode !== opt.value
                    ? "black"
                    : "white",
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
