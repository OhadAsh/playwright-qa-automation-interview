import { defineConfig, devices } from "@playwright/test";

// buildName is used for Tesults build name
// the environment variables come from Github Actions
// https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
const buildName = `${process.env.GITHUB_SHA?.slice(0, 7)}-${
  process.env.GITHUB_RUN_NUMBER
}-${process.env.GITHUB_RUN_ATTEMPT}`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 10000,
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ["line"],
        ["html", { open: "never" }],
        ["junit", { outputFile: "junit.xml" }],
        ["blob", { outputDir: "blob-report" }],
        [
          "playwright-tesults-reporter",
          {
            "tesults-target": process.env.PW_TESULTS_TOKEN,
            "tesults-build-name": buildName,
          },
        ],
      ]
    : [["html", { open: "never" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3001",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    /* Set custom id attribute */
    testIdAttribute: "id",
    /* Retain video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /lighthouse.spec.ts/,
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  // Run your local dev server before starting the tests */
  webServer: {
    command: 'cd todos-with-undo && npm start',
    url: 'http://127.0.0.1:3006',
    reuseExistingServer: !process.env.CI,
  },
});
