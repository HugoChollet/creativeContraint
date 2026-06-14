import { ThemedText } from "@/components/generic/themed-text";
import { useProfile } from "@/hooks/use-profile";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import ModalSelector from "../generic/modal-selector";
import { Spacer } from "../generic/spacer";
import { ProfileImagePicker } from "./pickers/image-profile-picker";
import { ThemeSwitcher } from "./theme-switcher";

const languages = [
  { label: "Français", value: "fr" },
  { label: "English", value: "en" },
];

const getSupportedLanguage = (language?: string | null): string => {
  const languageCode = language ?? "";

  return languages.some((item) => item.value === languageCode)
    ? languageCode
    : "en";
};

export default function Account({ session }: { session: Session }) {
  const { t, i18n } = useTranslation();
  const { globalStyles, colors } = useStyles();

  // Define the shape of your profile
  const { data, setData, loading, updateData } = useProfile("profiles", {
    username: "",
    website: "",
    avatar_url: "",
    language: "",
    theme: "",
  });
  const selectedLanguage = getSupportedLanguage(
    data.language || i18n.resolvedLanguage || i18n.language,
  );

  return (
    <>
      <Text style={globalStyles.subtitle}>{t("component:auth.title")}</Text>
      <View style={globalStyles.shadeContainer}>
        <ProfileImagePicker
          initialImage={data.avatar_url}
          onImageSelected={(image) =>
            setData({ ...data, avatar_url: image ?? "none" })
          }
        />
        <Text style={globalStyles.label}>
          {t("component:account.email_read_only")}
        </Text>
        <TextInput
          value={session?.user?.email}
          editable={false}
          style={[globalStyles.input, { opacity: 0.5, cursor: "not-allowed" }]}
        />
        <Spacer height={20} />

        <Text style={globalStyles.label}>
          {t("component:account.username")}
        </Text>
        <TextInput
          value={data.username || ""}
          onChangeText={(text) => setData({ ...data, username: text })}
          placeholder={t("component:account.username_placeholder")}
          style={globalStyles.input}
          placeholderTextColor={colors.textDiscreet}
        />
        <Spacer height={20} />

        <Text style={globalStyles.label}>
          {t("component:account.portfolio")}
        </Text>
        <TextInput
          value={data.website || ""}
          onChangeText={(text) => setData({ ...data, website: text })}
          placeholder="https://..."
          placeholderTextColor={colors.textDiscreet}
          style={globalStyles.input}
        />

        <Spacer height={20} />

        <ModalSelector
          label={t("screen:settings.language_selection")}
          options={languages}
          selectedValue={selectedLanguage}
          onValueChange={async (val) => {
            await i18n.changeLanguage(val);
            setData({ ...data, language: val });
          }}
        />
        <ThemeSwitcher
          onChange={(mode) => {
            setData({ ...data, theme: mode });
          }}
        />

        <Spacer height={20} />

        <TouchableOpacity
          style={globalStyles.secondaryButton}
          onPress={() => updateData(data)}
          disabled={loading}
        >
          <ThemedText style={globalStyles.secondaryButtonText}>
            {loading
              ? t("component:account.saving")
              : t("component:account.update_profile")}
          </ThemedText>
        </TouchableOpacity>
        <Spacer height={8} />
        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          style={[globalStyles.secondaryButton, globalStyles.alertButton]}
        >
          <Text style={globalStyles.alertText}>
            {t("component:account.sign_out")}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
