import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend, { type HttpBackendOptions } from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: import.meta.env.DEV
        ? `${import.meta.env.VITE_TRANSLATIONS_URL}/api/download/{{lng}}`
        : "/locales/{{lng}}.json",
    },

    fallbackLng: "en",
    supportedLngs: [
      "en",
      "it",
      "ch",
      "de",
      "es",
      "en",
      "fr",
      "in",
      "jp",
      "pt",
      "ru",
      "sa",
    ],
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
