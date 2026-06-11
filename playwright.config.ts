import { defineConfig } from "@playwright/test";

// Standaard gebruikt Playwright zijn eigen chromium (npx playwright install chromium).
// In omgevingen zonder toegang tot de Playwright-CDN kan een systeem-chromium
// worden aangewezen via PLAYWRIGHT_CHROMIUM_PATH.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    launchOptions: executablePath
      ? {
          executablePath,
          args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        }
      : {},
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
