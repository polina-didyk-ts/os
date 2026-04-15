import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: "./.env.test", quiet: true });

// CI environments are slower, so we use longer timeouts
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: isCI,
  // Retry failed tests in CI to handle transient failures
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 4,
  reporter: isCI
    ? [["html"], ["list"], ["github"], ["json", { outputFile: "playwright-report/results.json" }]]
    : [["html"], ["list"]],

  // Global timeout for each test (CI gets more time)
  timeout: isCI ? 60_000 : 30_000,

  // Expect timeout for assertions
  expect: {
    timeout: isCI ? 10_000 : 5_000,
  },

  use: {
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Action timeout (click, fill, etc.) - CI needs more time
    actionTimeout: isCI ? 15_000 : 10_000,

    // Navigation timeout
    navigationTimeout: isCI ? 30_000 : 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "yarn dev",
    url: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    reuseExistingServer: !isCI,
    // Give dev server more time to start in CI
    timeout: isCI ? 180_000 : 120_000,
    // Stdout/stderr helps debug server startup issues
    // stdout: "pipe",
    // stderr: "pipe",
  },
});
