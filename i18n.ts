import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your files
import bookEN from './assets/locales/en/book.json';
import commonEN from './assets/locales/en/common.json';
import musicEN from './assets/locales/en/music.json';
import photoEN from './assets/locales/en/photography.json';
import videoFictionEn from './assets/locales/en/videoFiction.json';
import videoInternet from './assets/locales/en/videoInternet.json';

import bookFR from './assets/locales/fr/book.json';
import commonFR from './assets/locales/fr/common.json';
import musicFR from './assets/locales/fr/music.json';
import photoFR from './assets/locales/fr/photography.json';
import videoFictionFr from './assets/locales/fr/videoFiction.json';
import videoInternetFr from './assets/locales/fr/videoInternet.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { book: bookEN, music: musicEN, common: commonEN, photo: photoEN, videoFiction: videoFictionEn, videoInternet: videoInternet },
    fr: { book: bookFR, music: musicFR, common: commonFR, photo: photoFR, videoFiction: videoFictionFr, videoInternet: videoInternetFr },
  },
  lng: 'fr', // or use react-native-localize to detect automatically
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;