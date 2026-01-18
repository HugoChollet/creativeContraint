import ModalSelector from "@/components/generic/modal-selector";
import { Spacer } from "@/components/generic/spacer";
import Account from "@/components/specific/account";
import Auth from "@/components/specific/auth";
import { ThemeSwitcher } from "@/components/specific/theme-switcher";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { globalStyles } = useStyles();

  const languages = [
    { label: "Français", value: "fr" },
    { label: "English", value: "en" },
    { label: "Español", value: "es" },
  ];

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <ScrollView
      style={[globalStyles.backgroundColor, { flex: 1, padding: 20 }]}
    >
      <View>
        {session && session.user ? <Account session={session} /> : <Auth />}
      </View>
      <Spacer height={20} />

      <ModalSelector
        label={t("screen:settings.language_selection")}
        options={languages}
        selectedValue={i18n.language}
        onValueChange={(val) => i18n.changeLanguage(val)}
      />
      <ThemeSwitcher />
    </ScrollView>
  );
}
