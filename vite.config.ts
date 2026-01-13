import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { i18nPlugin } from "./vite-plugin-i18n";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), i18nPlugin()],
});
