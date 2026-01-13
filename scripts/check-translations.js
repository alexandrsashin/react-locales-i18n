import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { globSync } from "glob";
import i18nextScanner from "i18next-scanner";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, "../src/locales");
const srcDir = path.resolve(__dirname, "../src");

// Recursively extracts all keys from translation object
function extractKeys(obj, prefix = "") {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.push(fullKey);
    } else if (typeof value === "object" && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    }
  }

  return keys;
}

// Main function
async function findUnusedTranslations() {
  console.log("🔍 Analyzing translations...\n");

  // Get all translation files using glob
  const translationFiles = globSync("*.ts", {
    cwd: localesDir,
    ignore: ["index.ts", "types.ts"],
  });

  if (translationFiles.length === 0) {
    console.log("❌ Translation files not found");
    return;
  }

  // Collect all keys from all namespaces
  const allTranslationKeys = new Map(); // namespace:key -> count

  for (const file of translationFiles) {
    const filePath = path.join(localesDir, file);
    const fileUrl = pathToFileURL(filePath).href;

    try {
      const module = await import(fileUrl);
      const data = module.default;

      if (!data.namespace) continue;

      const namespace = data.namespace;

      // Extract keys from first language (assuming same structure)
      const languages = Object.keys(data).filter((key) => key !== "namespace");
      if (languages.length === 0) continue;

      const firstLang = languages[0];
      const keys = extractKeys(data[firstLang]);

      // Add with namespace prefix
      for (const key of keys) {
        const fullKey = `${namespace}:${key}`;
        allTranslationKeys.set(fullKey, 0);
      }

      console.log(`✓ Loaded ${keys.length} keys from ${namespace}`);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  }

  console.log(`\n📊 Total found ${allTranslationKeys.size} translation keys\n`);

  // Get all source files using glob
  const sourceFiles = globSync("**/*.{ts,tsx}", {
    cwd: srcDir,
    ignore: ["**/locales/**", "**/node_modules/**", "**/dist/**"],
    absolute: true,
  });

  console.log(`📁 Scanning ${sourceFiles.length} files...\n`);

  // Use i18next-scanner to find keys
  const usedKeysSet = new Set();
  const keyPrefixUsages = []; // For statistics

  const scannerOptions = {
    func: {
      list: ["t"],
      extensions: [".ts", ".tsx"],
    },
    trans: {
      component: "Trans",
      i18nKey: "i18nKey",
    },
    lngs: ["en"],
    ns: [],
    defaultLng: "en",
    defaultNs: "translation",
    nsSeparator: ":",
    keySeparator: ".",
  };

  // Create parser once
  const parser = new i18nextScanner.Parser(scannerOptions);

  // Scan files
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, "utf-8");

    // Find useTranslation with keyPrefix
    const keyPrefixPattern =
      /useTranslation\s*\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*keyPrefix:\s*['"]([^'"]+)['"]\s*\}/g;
    const keyPrefixes = [];
    let prefixMatch;

    while ((prefixMatch = keyPrefixPattern.exec(content)) !== null) {
      keyPrefixes.push({
        namespace: prefixMatch[1],
        prefix: prefixMatch[2],
      });
      keyPrefixUsages.push({
        file: path.relative(process.cwd(), file),
        namespace: prefixMatch[1],
        prefix: prefixMatch[2],
      });
    }

    // Parse using i18next-scanner
    parser.parseFuncFromString(content, { list: ["t"] }, (key) => {
      usedKeysSet.add(key);

      // If keyPrefix exists, add variants with prefixes
      for (const { namespace, prefix } of keyPrefixes) {
        // If key doesn't contain namespace, try with prefix
        if (!key.includes(":")) {
          usedKeysSet.add(`${namespace}:${prefix}.${key}`);
        }
      }
    });

    // Also find Trans components manually (i18next-scanner may miss them)
    const transPattern = /i18nKey=['"]([^'"]+)['"]/g;
    let match;
    while ((match = transPattern.exec(content)) !== null) {
      usedKeysSet.add(match[1]);
    }
  }

  // Count usage
  for (const key of usedKeysSet) {
    if (allTranslationKeys.has(key)) {
      allTranslationKeys.set(key, allTranslationKeys.get(key) + 1);
    }
  }

  // Find unused keys
  const unusedKeys = [];
  const usedKeys = [];

  for (const [key, count] of allTranslationKeys.entries()) {
    if (count === 0) {
      unusedKeys.push(key);
    } else {
      usedKeys.push({ key, count });
    }
  }

  // Output results
  console.log("📈 Analysis results:\n");
  console.log(`✅ Used: ${usedKeys.length} keys`);
  console.log(`❌ Unused: ${unusedKeys.length} keys`);

  if (keyPrefixUsages.length > 0) {
    console.log(`🔑 Found ${keyPrefixUsages.length} keyPrefix usages\n`);
  } else {
    console.log();
  }

  if (unusedKeys.length > 0) {
    console.log("🗑️  Unused translation keys:\n");

    // Group by namespace
    const byNamespace = {};
    for (const key of unusedKeys) {
      const [namespace, ...rest] = key.split(":");
      if (!byNamespace[namespace]) {
        byNamespace[namespace] = [];
      }
      byNamespace[namespace].push(rest.join(":"));
    }

    for (const [namespace, keys] of Object.entries(byNamespace)) {
      console.log(`  📦 ${namespace}:`);
      keys.forEach((key) => console.log(`     • ${key}`));
      console.log();
    }

    process.exit(1);
  } else {
    console.log("🎉 All translation keys are used!");
  }
}

findUnusedTranslations().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
