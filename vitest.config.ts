import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Aparte vitest-config zodat Playwright-specs in e2e/ buiten vitest blijven.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts", "api/**/*.test.ts"],
  },
});
