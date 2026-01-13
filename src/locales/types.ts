export type TranslationValue = string | { [key: string]: TranslationValue };

export interface TranslationModule {
  namespace: string;
  [key: string]: TranslationValue;
}
