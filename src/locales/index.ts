import type { TranslationValue } from "./types";

// Automatically import all translation files (except index.ts)
const modules = import.meta.glob<{
  default: { namespace: string; [key: string]: TranslationValue };
}>("./*.ts", { eager: true });

// Collect all modules from imports
const namespaces = Object.entries(modules)
  .filter(([path]) => !path.includes("index.ts") && !path.includes("types.ts"))
  .map(([, module]) => module.default);

// Automatically detect available languages from the first file
const firstModule = namespaces[0];
const detectedLanguages = firstModule
  ? (Object.keys(firstModule).filter((key) => key !== "namespace") as string[])
  : [];

// Form resources for all languages
export const resources = Object.fromEntries(
  detectedLanguages.map((lang) => [
    lang,
    Object.fromEntries(
      namespaces.map((ns) => [ns.namespace, ns[lang as keyof typeof ns]])
    ),
  ])
);

export const availableLanguages = detectedLanguages;
export type AvailableLanguage = (typeof availableLanguages)[number];

// Export modules for typing (optional)
export const namespaceModules = Object.fromEntries(
  Object.entries(modules)
    .filter(
      ([path]) => !path.includes("index.ts") && !path.includes("types.ts")
    )
    .map(([path, module]) => {
      const name = path.replace("./", "").replace(".ts", "");
      return [name, module.default];
    })
);
