/**
 * Browser tests, run against the built app: `npm run test:ui`.
 *
 * Two of the bugs in the build reports behind this template were visible ONLY in a
 * screenshot — a paint effect on an inline element with no box, and a white band
 * around a dark-mode app. Neither produced an error anywhere. `toHaveScreenshot`
 * commits a reference image and fails when the rendering changes, which is the only
 * gate that catches that class of defect.
 *
 * First run writes the baselines. Review them before committing — a baseline recorded
 * from a broken render locks the bug in.
 *
 *     npm run test:ui              # run
 *     npm run test:ui -- --update-snapshots
 */

import { test, expect } from '@playwright/test';

import { installPtStub } from './pt-stub.mjs';

/** The host drives the theme; the bootstrap in index.html applies the class. */
const themes = ['light', 'dark'];

for (const theme of themes) {
  test(`the ${theme} theme reaches <html>, including its background`, async ({ page }) => {
    await page.goto(`/?theme=${theme}`);

    await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));

    // `html` must paint, not just `body`. A viewport taller than the app shell —
    // over-scroll, a short page — otherwise shows the default white canvas around a
    // dark app. Invisible in a screenshot of the app, obvious in one of the frame.
    const background = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor
    );
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
    expect(background).not.toBe('transparent');
    if (theme === 'dark') expect(background).not.toBe('rgb(255, 255, 255)');
  });
}

test('the app renders without a boundary error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('The app hit a rendering error')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// Add a screenshot per screen once there is something to see. Keep them narrow:
// one per screen and per theme is reviewable, one per component is not.
//
// test('the board matches its reference rendering', async ({ page }) => {
//   await page.goto('/?theme=dark');
//   await expect(page).toHaveScreenshot('board-dark.png', { fullPage: true });
// });


// ---------------------------------------------------------------------------
// The canonical browser stub. Delete these once your own screens use it — but
// keep the reload case: it is the one an in-memory stub passes and a real bug
// (state held in useState) fails.
// ---------------------------------------------------------------------------

test.describe('pt stub', () => {
  test('seeds rows a screen can render', async ({ page }) => {
    await installPtStub(page, { seed: { task: [{ title: 'Seeded' }] } });
    await page.goto('/');

    const rows = await page.evaluate(() => window.pt.list({ entityNames: ['task'] }));
    expect(rows).toHaveLength(1);
    expect(rows[0].data.title).toBe('Seeded');
    // A bare array, like the real pt — not { entities: [...] }.
    expect(Array.isArray(rows)).toBe(true);
  });

  test('a written row survives a reload', async ({ page }) => {
    await installPtStub(page);
    await page.goto('/');

    await page.evaluate(() => window.pt.add('task', { title: 'Persisted' }));
    await page.reload();

    const titles = await page.evaluate(async () =>
      (await window.pt.list({ entityNames: ['task'] })).map((r) => r.data.title));
    expect(titles).toContain('Persisted');
  });

  test('an unimplemented method throws instead of returning undefined', async ({ page }) => {
    await installPtStub(page);
    await page.goto('/');

    const message = await page.evaluate(() => {
      try { window.pt.addMessage('hi'); return null; } catch (e) { return e.message; }
    });
    expect(message).toContain('not implemented by the browser test stub');
  });
});
