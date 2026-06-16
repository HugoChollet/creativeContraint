import ModalSelector from "@/components/generic/modal-selector";
import { Spacer } from "@/components/generic/spacer";
import { useAuth } from "@/contexts/auth-context";
import { ThemeMode } from "@/contexts/theme-context";
import {
  APP_LANGUAGES,
  getSupportedAppLanguage,
  setStoredAppLanguage,
  setStoredThemeMode,
} from "@/lib/app-preferences";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ThemeSwitcher } from "./theme-switcher";

export function AppPreferences() {
  const { session } = useAuth();
  const { t, i18n } = useTranslation();

  const selectedLanguage = getSupportedAppLanguage(
    i18n.resolvedLanguage || i18n.language,
  );

  const syncProfilePreference = async (
    updates: Partial<Record<"language" | "theme", string>>,
  ) => {
    if (!session?.user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      ...updates,
      updated_at: new Date(),
    });

    if (error) {
      console.error("Could not sync app preference:", error.message);
    }
  };

  const handleLanguageChange = async (language: string) => {
    const nextLanguage = getSupportedAppLanguage(language);

    await i18n.changeLanguage(nextLanguage);
    await setStoredAppLanguage(nextLanguage);
    await syncProfilePreference({ language: nextLanguage });
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    await setStoredThemeMode(theme);
    await syncProfilePreference({ theme });
  };

  return (
    <View>
      <ModalSelector
        label={t("screen:settings.language_selection")}
        options={APP_LANGUAGES.map((language) => ({ ...language }))}
        selectedValue={selectedLanguage}
        onValueChange={(value) => {
          void handleLanguageChange(value);
        }}
      />
      <ThemeSwitcher onChange={handleThemeChange} />
      <Spacer height={4} />
    </View>
  );
}
