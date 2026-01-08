import ModalSelector from '@/components/ui/modal-selector';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const languages = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', padding: 20 }}>
      <ModalSelector
        label={t('common:settings.language_selection')}
        options={languages}
        selectedValue={i18n.language}
        onValueChange={(val) => i18n.changeLanguage(val)}
      />
    </View>
  );
}