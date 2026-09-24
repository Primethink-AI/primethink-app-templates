import { createHash } from 'node:crypto';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the BUILT app, served the way PrimeThink serves it.
 *
 * `vite preview` is used only as a static file server for `dist/` here. It is not a
 * substitute for the platform: there is no `window.pt`, so persistence, `pt.add` /
 * `pt.list` and real-time sync cannot be exercised at all. What this config IS good
 * for is everything that does not need the platform — layout, the theme bridge,
 * keyboard and focus behaviour, and screenshots. `tests/live.mjs` covers the rest.
 */

/**
 * A port belonging to THIS project, derived from its path.
 *
 * Every scaffold used to hardcode 4173. With `reuseExistingServer` that meant a
 * second project's suite silently adopted the first project's server and tested
 * the wrong build — a green run proving nothing. In one case a months-old orphaned
 * preview from another app was adopted and failed 20 tests against somebody else's
 * selectors. Four separate projects each diagnosed this and hand-picked a port
 * (4186, 4187, 4191, 4195), because the fix cannot be made from inside a generated
 * project.
 *
 * Derived rather than random so it is stable across runs. Range 4200-4899 avoids
 * Vite's 4173 and the 5173 dev port.
 *
 * A derived port lowers the odds of sharing a server; it cannot prove the server on
 * it is ours — two projects can hash to the same port. So an already-running server
 * is NOT reused by default: Playwright builds and serves this project every run, and
 * if the port is taken it fails loudly instead of testing somebody else's build.
 * Set PT_REUSE_PREVIEW=1 to reuse a preview you started yourself for fast iteration,
 * and PT_PREVIEW_PORT to move off a port that collides.
 */
const projectDir = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PT_PREVIEW_PORT)
  || 4200 + (parseInt(createHash('sha1').update(projectDir).digest('hex').slice(0, 8), 16) % 700);

const ORIGIN = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: ORIGIN,
    // A trace on the first retry turns "it failed in CI" into a clickable timeline.
    trace: 'on-first-retry',
    // Use an already-installed Chrome when `npx playwright install` is unreliable.
    ...(process.env.PT_CHROME ? { launchOptions: { executablePath: process.env.PT_CHROME } } : {})
  },
  // Screenshots differ by a pixel or two across machines and font rendering.
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The port lives here, not in package.json: one source, and `npm run preview`
    // stays a plain human-facing command.
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI && process.env.PT_REUSE_PREVIEW === '1',
    timeout: 120_000
  }
});

export { PORT, ORIGIN, projectDir as __projectDir, basename as __basename };
