// Automatically import all translation files (except index.ts)
const modules = import.meta.glob("./*.ts", { eager: true });

// Collect all modules from imports
const namespaceModules = Object.entries(modules)
  .filter(([path]) => !path.includes("index.ts") && !path.includes("types.ts"))
  .map(([, module]: [string, any]) => module.default);

// Form resources for all languages
const resources = {
  en: Object.fromEntries(namespaceModules.map((ns) => [ns.namespace, ns.en])),
  ru: Object.fromEntries(namespaceModules.map((ns) => [ns.namespace, ns.ru])),
};

export { resources };
