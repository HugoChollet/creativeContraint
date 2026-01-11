import Account from '@/components/account';
import Auth from '@/components/auth';
import ModalSelector from '@/components/ui/modal-selector';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const languages = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', padding: 20 }}>
      <ThemeSwitcher />
      <ModalSelector
        label={t('common:settings.language_selection')}
        options={languages}
        selectedValue={i18n.language}
        onValueChange={(val) => i18n.changeLanguage(val)}
      />
    <View>
      {session && session.user ? <Account session={session} /> : <Auth />}
    </View>
    </View>
  );
}