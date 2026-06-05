import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ── Directories ──────────────────────────────────────────────────────────
  testDir: './src/tests',

  // ── Execution ────────────────────────────────────────────────────────────
  timeout:       45_000,   // per-test timeout
  retries:       1,        // retry once on flaky network / demo server
  workers:       1,        // serial: avoids booking ID conflicts on demo site
  fullyParallel: false,

  // ── Reporters ────────────────────────────────────────────────────────────
  reporter: [
    ['list'],                                          // live console output
    ['html',  { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'results/junit-report.xml' }],
  ],

  // ── Shared browser settings ───────────────────────────────────────────────
  use: {
    baseURL:          'https://webapps.tekstac.com/SeleniumApp2/CallTaxiService',
    headless:         true,
    viewport:         { width: 1280, height: 720 },
    screenshot:       'only-on-failure',   // saved to test-results/
    trace:            'retain-on-failure', // open with: npx playwright show-trace
    video:            'off',
    actionTimeout:    10_000,
    navigationTimeout:20_000,
  },

  // ── Projects (browser matrix) ────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
