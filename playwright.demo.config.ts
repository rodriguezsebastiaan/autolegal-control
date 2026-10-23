import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/demo",
  fullyParallel: false,
  timeout: 120_000,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  workers: 1,
  projects: [
    { name: "demo-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "demo-mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run demo",
    url: "http://127.0.0.1:3000/panel",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
