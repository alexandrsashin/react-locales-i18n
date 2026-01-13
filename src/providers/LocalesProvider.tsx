import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { initializeI18n } from "../i18n";

interface LocalesProviderProps {
  children: ReactNode;
}

export function LocalesProvider({ children }: LocalesProviderProps) {
  const [isInitialized, setIsInitialized] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      initializeI18n({ defaultLanguage: "en", fallbackLanguage: "en" }).then(
        () => {
          setIsInitialized(true);
        }
      );
    }
  }, []);

  if (!isInitialized) {
    return null; // or loading spinner
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
