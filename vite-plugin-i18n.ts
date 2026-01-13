import fs from "fs";
import path from "path";
import type { Plugin } from "vite";
import type { TranslationModule } from "./src/locales/types";

export function i18nPlugin(): Plugin {
  return {
    name: "vite-plugin-i18n-translations",

    buildStart() {
      const localesDir = path.resolve(process.cwd(), "src/locales");
      const publicDir = path.resolve(process.cwd(), "public/locales");

      // Create public/locales directory
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Find all .ts files in locales directory (except index.ts)
      const files = fs
        .readdirSync(localesDir)
        .filter(
          (file) =>
            file.endsWith(".ts") && file !== "index.ts" && file !== "types.ts"
        );

      if (files.length === 0) {
        console.warn("No translation files found in src/locales");
        return;
      }

      console.log(`\n🌐 Building translations from ${files.length} files...`);

      // Import and process each translation file
      const imports = files.map(async (file) => {
        const filePath = path.join(localesDir, file);
        const fileUrl = `file://${filePath}`;

        try {
          const module = await import(fileUrl);
          const data: TranslationModule = module.default;

          if (!data.namespace) {
            console.warn(`⚠️  File ${file} is missing 'namespace' property`);
            return;
          }

          // Extract all language keys (excluding 'namespace')
          const languages = Object.keys(data).filter(
            (key) => key !== "namespace"
          );

          if (languages.length === 0) {
            console.warn(`⚠️  File ${file} has no language translations`);
            return;
          }

          // Generate JSON files for each language
          languages.forEach((lang) => {
            const translations = data[lang];
            const outputDir = path.join(publicDir, lang);

            // Create language directory
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write JSON file
            const outputFile = path.join(outputDir, `${data.namespace}.json`);
            fs.writeFileSync(outputFile, JSON.stringify(translations, null, 2));
            console.log(`  ✓ ${lang}/${data.namespace}.json`);
          });
        } catch (error) {
          console.error(`❌ Error processing ${file}:`, error);
        }
      });

      return Promise.all(imports).then(() => {
        console.log("✅ Translation build complete\n");
      });
    },
  };
}
