import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the BUILT app, served the way PrimeThink serves it.
 *
 * `vite preview` is used only as a static file server for `dist/` here. It is not a
 * substitute for the platform: there is no `window.pt`, so persistence, `pt.add` /
 * `pt.list` and real-time sync cannot be exercised at all. What this config IS good
 * for is everything that does not need the platform — layout, the theme bridge,
 * keyboard and focus behaviour, and screenshots.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    // A trace on the first retry turns "it failed in CI" into a clickable timeline.
    trace: 'on-first-retry'
  },
  // Screenshots differ by a pixel or two across machines and font rendering.
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
