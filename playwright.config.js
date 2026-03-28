const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3100/health",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      PORT: "3100",
      NODE_ENV: "test"
    }
  }
});