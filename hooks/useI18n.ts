// i18n.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../assets/locales/en.json";
import th from "../assets/locales/th.json";

const LANGUAGE_KEY = "APP_LANGUAGE";
const DEFAULT_LANGUAGE = "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    th: { translation: th },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export const changeLanguage = async (lng: string) => {
  try {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    console.log("Language changed to:", lng);
  } catch (error) {
    console.error("Failed to change language:", error);
  }
};

export const loadLanguage = async () => {
  try {
    const savedLng = await AsyncStorage.getItem(LANGUAGE_KEY);
    const lng = savedLng || DEFAULT_LANGUAGE;
    await i18n.changeLanguage(lng);
    if (!savedLng) {
      await AsyncStorage.setItem(LANGUAGE_KEY, DEFAULT_LANGUAGE);
    }

    console.log("Loaded language:", lng);
  } catch (error) {
    console.error("Failed to load language:", error);
  }
};

export default i18n;
