const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 0,
  outputDir: "../../.sisyphus/evidence/playwright-output",
  use: {
    baseURL: "http://127.0.0.1:48217",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 960 },
      },
    },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: "npm run serve -- --host 127.0.0.1 --port 48217",
    url: "http://127.0.0.1:48217",
    timeout: 120000,
    reuseExistingServer: true,
  },
});
