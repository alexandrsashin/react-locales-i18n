# React + i18next Multilingual Support

This project implements multilingual support with the following features:

## Features

- ✅ **TypeScript translations in development** with HMR support
- ✅ **JSON translations in production** for optimal loading
- ✅ **Relative path loading** - works regardless of deployment location
- ✅ **Type-safe translations** with TypeScript autocomplete
- ✅ **Namespace-based structure** - organize translations by feature
- ✅ **Automatic translation checking** - detect unused keys
- ✅ **KeyPrefix support** - detect usage with keyPrefix pattern

## Project Structure

```
src/
  locales/
    common.ts          # Common translations (TypeScript)
    users.ts           # Users module translations
    roles.ts           # Roles module translations
    products.ts        # Products module translations
    settings.ts        # Settings module translations
    index.ts           # Auto-imports all namespaces
    types.ts           # TypeScript type definitions
  i18n.ts              # i18next dual-mode configuration

scripts/
  check-translations.js  # Analyzes translation usage

vite-plugin-i18n.ts    # Auto-generates JSON at build time

public/
  locales/              # Generated JSON files (production only)
    en/
      common.json
      users.json
      roles.json
      products.json
      settings.json
    ru/
      common.json
      users.json
      roles.json
      products.json
      settings.json
```

## How It Works

### Development Mode

**i18n Configuration (`src/i18n.ts`):**

- Detects mode via `import.meta.env.DEV`
- Uses direct TypeScript file imports from `src/locales/index.ts`
- Initializes i18next synchronously with ready resources
- Automatically detects all namespaces from imported resources

**Benefits:**

- ✅ Hot Module Replacement (HMR) - changes appear instantly
- ✅ TypeScript validation and autocomplete
- ✅ No build or file generation required

**Vite Plugin:** Not activated in development mode

### Production Mode

**Vite Plugin (`vite-plugin-i18n.ts`):**

- Triggers on `buildStart` hook before project build
- Scans `src/locales/` directory and finds all `.ts` files (except `index.ts` and `types.ts`)
- Dynamically imports each translation file via `import(file://...)`
- Extracts `namespace` and languages from each module
- Generates JSON files in structure `public/locales/{language}/{namespace}.json`
- Outputs generation progress to console for each file

**i18n Configuration (`src/i18n.ts`):**

- Uses `i18next-http-backend` to load JSON
- Loads translations via relative path: `./locales/{{lng}}/{{ns}}.json`
- Loads namespaces on-demand (lazy loading)

**Benefits:**

- ✅ Optimized JSON files without TypeScript overhead
- ✅ Lazy loading - namespaces load only when needed
- ✅ Relative paths - works in any deployment directory
- ✅ Automatic generation - no manual configuration required

## Usage

### Running Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

This automatically:

1. Vite plugin generates JSON files from TypeScript during build
2. Compiles TypeScript
3. Builds with Vite

### Preview Production Build

```bash
npm run preview
```

### Check Translation Usage

```bash
# Check for unused translation keys
npm run check:translations

# Show detailed statistics with keyPrefix usage
npm run check:translations -- --stats
```

### Code Quality Checks

```bash
# Check for unused exports, dependencies, and files
npm run knip

# Check only production dependencies
npm run knip:production
```

## Adding New Namespaces

1. Create a new file in `src/locales/`, e.g., `src/locales/dashboard.ts`
2. Add translations for all languages:

```typescript
export default {
  namespace: "dashboard",
  en: {
    title: "Dashboard",
    stats: "Statistics",
    // ... other translations
  },
  ru: {
    title: "Панель управления",
    stats: "Статистика",
    // ... other translations
  },
} as const;
```

3. The file will be automatically discovered by `src/locales/index.ts` (uses `import.meta.glob`)
4. No manual import required!

## Adding New Languages

1. Add language support to existing namespace files:

```typescript
export default {
  namespace: "common",
  en: {
    /* ... */
  },
  ru: {
    /* ... */
  },
  fr: {
    // Add new language
    welcome: "Bienvenue",
    // ... other translations
  },
} as const;
```

2. Languages are auto-detected from the first loaded module

## Configuration

### Vite Config

- `base: './'` - ensures relative paths work anywhere
- Works with any deployment location (root, subdirectory, CDN)
- Custom plugin `vite-plugin-i18n` handles TS→JSON conversion

### i18next Config

- Development: Uses direct TS imports for HMR
- Production: Uses HTTP Backend with relative paths
- Falls back to English if translation is missing
- Supports multiple namespaces loaded on-demand
- KeySeparator: `.` for nested keys (e.g., `counter.button`)
- NsSeparator: `:` for namespaces (e.g., `common:welcome`)

### Knip Config

- Configured to ignore translation files and types
- Ignores Vite plugin file
- Checks for unused exports, dependencies, and files

## Example Usage in Components

```tsx
import { useTranslation, Trans } from "react-i18next";

function MyComponent() {
  // Use specific namespace
  const { t, i18n } = useTranslation("common");

  // Simple translation
  const title = t("welcome");

  // Translation with interpolation
  const count = t("counter.button", { count: 5 });

  // Translation with HTML/components
  return (
    <Trans i18nKey="common:counter.description">
      Edit <code>src/App.tsx</code> and save
    </Trans>
  );

  // Change language
  i18n.changeLanguage("ru");
}

// Using keyPrefix for shorter keys
function UsersComponent() {
  const { t } = useTranslation("users", { keyPrefix: "form" });

  // t("name") automatically resolves to "users:form.name"
  return (
    <div>
      <label>{t("name")}</label>
      <label>{t("email")}</label>
    </div>
  );
}

// Using multiple namespaces
function DashboardComponent() {
  const { t } = useTranslation(["common", "dashboard"]);

  return (
    <div>
      <h1>{t("common:welcome")}</h1>
      <p>{t("dashboard:stats")}</p>
    </div>
  );
}
```

## Benefits

1. **Developer Experience**: Edit TypeScript files with autocomplete and type checking
2. **Performance**: Production uses optimized JSON files loaded on-demand per namespace
3. **Flexibility**: Relative paths work in any deployment scenario
4. **Type Safety**: Full TypeScript support prevents typos in translation keys
5. **Maintainability**: Namespace-based structure organizes translations by feature
6. **Automation**: Auto-discovery of translation files, no manual imports needed
7. **Quality Tools**: Built-in checks for unused translations and code
8. **HMR Support**: Language selection persists across hot reloads
9. **KeyPrefix Detection**: Translation checker understands keyPrefix patterns
