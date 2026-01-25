import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import boardGameEN from "./assets/locales/en/boardgame.json";
import bookEN from "./assets/locales/en/book.json";
import componentEN from "./assets/locales/en/component.json";
import cookingEN from "./assets/locales/en/cooking.json";
import musicEN from "./assets/locales/en/music.json";
import photoEN from "./assets/locales/en/photography.json";
import screenEN from "./assets/locales/en/screen.json";
import videoFictionEN from "./assets/locales/en/videoFiction.json";
import videoInternetEN from "./assets/locales/en/videoInternet.json";

import boardGameFR from "./assets/locales/fr/boardgame.json";
import bookFR from "./assets/locales/fr/book.json";
import componentFR from "./assets/locales/fr/component.json";
import cookingFR from "./assets/locales/fr/cooking.json";
import musicFR from "./assets/locales/fr/music.json";
import photoFR from "./assets/locales/fr/photography.json";
import screenFR from "./assets/locales/fr/screen.json";
import videoFictionFR from "./assets/locales/fr/videoFiction.json";
import videoInternetFR from "./assets/locales/fr/videoInternet.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      screen: screenEN,
      component: componentEN,
      book: bookEN,
      music: musicEN,
      photo: photoEN,
      videoFiction: videoFictionEN,
      videoInternet: videoInternetEN,
      cooking: cookingEN,
      boardGame: boardGameEN,
    },
    fr: {
      screen: screenFR,
      component: componentFR,
      book: bookFR,
      music: musicFR,
      photo: photoFR,
      videoFiction: videoFictionFR,
      videoInternet: videoInternetFR,
      cooking: cookingFR,
      boardGame: boardGameFR,
    },
  },
  lng: "fr", // or use react-native-localize to detect automatically
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
