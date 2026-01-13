import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./locales";

const isDevelopment = import.meta.env.DEV;

export const getI18nConfig = (options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  detectLanguage?: boolean;
}) => {
  const defaultLanguage = options?.defaultLanguage || "en";
  const fallbackLanguage = options?.fallbackLanguage || "en";
  const detectLanguage = options?.detectLanguage ?? true;
  const namespaces = Object.keys(resources.en || {});
  const defaultNS = namespaces[0] || "common";

  const baseConfig = {
    lng: detectLanguage ? undefined : defaultLanguage,
    fallbackLng: fallbackLanguage,
    defaultNS,
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ["navigator", "htmlTag"],
      caches: [],
    },
  };

  if (isDevelopment) {
    // In development, use imported TS resources
    return {
      ...baseConfig,
      resources,
    };
  } else {
    // In production, load JSON files via HTTP backend
    return {
      ...baseConfig,
      backend: {
        loadPath: "./locales/{{lng}}/{{ns}}.json",
      },
    };
  }
};

export const initializeI18n = async (options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  detectLanguage?: boolean;
}) => {
  if (i18n.isInitialized) {
    return i18n;
  }

  const config = getI18nConfig(options);

  if (isDevelopment) {
    await i18n.use(LanguageDetector).use(initReactI18next).init(config);
  } else {
    await i18n
      .use(LanguageDetector)
      .use(HttpBackend)
      .use(initReactI18next)
      .init(config);
  }

  return i18n;
};

// Auto-initialize for non-provider usage
initializeI18n();

// HMR: reload resources when translation files change
if (isDevelopment && import.meta.hot) {
  import.meta.hot.accept("./locales", async (newModule) => {
    if (newModule && i18n.isInitialized) {
      const newResources = newModule.resources;

      // Get current language
      const currentLang = i18n.language;

      // Add new resources for all languages
      Object.keys(newResources).forEach((lng) => {
        Object.keys(newResources[lng]).forEach((ns) => {
          i18n.addResourceBundle(lng, ns, newResources[lng][ns], true, true);
        });
      });

      // Trigger re-render by changing language (even to the same one)
      await i18n.changeLanguage(currentLang);

      console.log("🔄 Translations reloaded");
    }
  });
}

export default i18n;
