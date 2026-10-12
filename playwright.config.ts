import { defineConfig, devices } from "@playwright/test";

// Phone checks for the home page and main pages (see tests/mobile).
// Runs in the Google Chrome that is already installed, at iPhone and Android
// screen sizes with touch turned on, so no extra browser needs downloading.
//
//   npm run test:mobile                       builds, starts the site, runs the tests
//   BASE_URL=https://cse-spotlight.vercel.app npx playwright test   checks the live site
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const chrome = { browserName: "chromium" as const, channel: "chrome" };

export default defineConfig({
  testDir: "tests/mobile",
  timeout: 30_000,
  retries: 1,
  reporter: [["list"]],
  use: { baseURL: BASE_URL },
  projects: [
    { name: "iPhone 13", use: { ...devices["iPhone 13"], ...chrome } },
    { name: "Pixel 7", use: { ...devices["Pixel 7"], ...chrome } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npx next start -p 3100", url: BASE_URL, reuseExistingServer: true, timeout: 60_000 },
});
