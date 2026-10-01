import { defineConfig, devices } from "@playwright/test";

const PORT = 3217;
const FAKE_JEV_PORT = 4599;
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    // Playwright ships no Chromium for older Linux releases; outside CI, use the installed Chrome.
    ...(CI ? {} : { channel: "chrome" }),
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `node e2e/fake-jev.mjs`,
      port: FAKE_JEV_PORT,
      env: { FAKE_JEV_PORT: String(FAKE_JEV_PORT) },
      reuseExistingServer: !CI,
    },
    {
      command: `npx next start -p ${String(PORT)}`,
      port: PORT,
      env: {
        TYPESAFE_API_KEY: "e2e",
        TYPESAFE_API_URL: `http://127.0.0.1:${String(FAKE_JEV_PORT)}`,
        AUDIENCE_RATE_LIMIT: "1000",
        SITE_URL: `http://localhost:${String(PORT)}`,
      },
      reuseExistingServer: !CI,
    },
  ],
});
