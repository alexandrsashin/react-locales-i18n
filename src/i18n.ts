import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { resources } from "./locales";

const isDevelopment = import.meta.env.DEV;

// Get saved language or use default
const LANGUAGE_KEY = "i18n_language";
const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || "en";

// Automatically get list of namespaces from resources
const namespaces = Object.keys(resources.en || {});
const defaultNS = namespaces[0] || "common";

// Initialize i18next synchronously
if (isDevelopment) {
  // In development, use imported TS resources
  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    defaultNS,
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
} else {
  // In production, load JSON files via HTTP backend
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: savedLanguage,
      fallbackLng: "en",
      defaultNS,
      ns: namespaces,
      backend: {
        // Use relative path from the script location
        loadPath: "./locales/{{lng}}/{{ns}}.json",
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

// Save language to localStorage on change
i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
