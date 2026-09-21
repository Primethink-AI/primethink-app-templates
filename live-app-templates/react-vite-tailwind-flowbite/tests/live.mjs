/**
 * The only test that proves the platform.
 *
 * `npm test` proves your domain rules and `npm run test:ui` proves render, theme and
 * layout — neither touches `pt`. This loads the app the way PrimeThink serves it, with
 * a real `window.pt` and a real Chat DB, and is the only way to claim that data
 * persists. Three build reports shipped an app that had never once met a real `pt`.
 *
 *   node tests/live.mjs <chat-uuid>
 *
 * Environment:
 *   PT_HOST      api host, default app-dev.primethink.ai
 *   PT_API_KEY   an API key for that host  (required)
 *   PT_CHROME    optional path to an existing Chrome
 *
 * The Authorization header is scoped with `page.route` to the API host ONLY: the
 * served page also loads third-party assets (socket.io from a CDN), and a
 * context-wide header would hand your key to them.
 */
import { chromium } from '@playwright/test';

const CHAT = process.argv[2];
const HOST = process.env.PT_HOST || 'app-dev.primethink.ai';
const KEY = process.env.PT_API_KEY;

if (!CHAT || !KEY) {
  console.error('usage: PT_API_KEY=... node tests/live.mjs <chat-uuid>');
  process.exit(2);
}

const browser = await chromium.launch(
  process.env.PT_CHROME ? { executablePath: process.env.PT_CHROME } : {}
);
const ctx = await browser.newContext();

await ctx.route('**/*', (route) => {
  const url = new URL(route.request().url());
  return url.hostname === HOST
    ? route.continue({ headers: { ...route.request().headers(), Authorization: `Token ${KEY}` } })
    : route.continue();
});

const page = await ctx.newPage();
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

page.on('pageerror', (e) => failures.push(`page error: ${e.message}`));

await page.goto(`https://${HOST}/api/v1/live/${CHAT}`, { waitUntil: 'networkidle' });

check(await page.evaluate(() => typeof window.pt === 'object' && window.pt !== null),
  'window.pt is injected');
check(!(await page.evaluate(() => Boolean(window.pt?.__isTestStub))),
  'it is the real pt, not a stub');
check(await page.getByText('The app hit a rendering error').count() === 0,
  'the app rendered without a boundary error');

// Write, reload, read back. The check that means something: an app holding state in
// useState passes every in-memory test and fails this one.
const probe = `live-check-${Date.now()}`;
const wrote = await page.evaluate(async (title) => {
  try { return Boolean((await window.pt.add('live_check', { title }))?.entity?.id); }
  catch (e) { return `error: ${e.message}`; }
}, probe);
check(wrote === true, `pt.add wrote a row (${wrote})`);

await page.reload({ waitUntil: 'networkidle' });

const survived = await page.evaluate(async (title) => {
  const rows = await window.pt.list({ entityNames: ['live_check'] });
  return (Array.isArray(rows) ? rows : rows?.entities ?? []).some((r) => r.data?.title === title);
}, probe);
check(survived, 'the row survived a reload — data is in Chat DB, not in memory');

// Leave the chat as we found it.
await page.evaluate(async (title) => {
  const rows = await window.pt.list({ entityNames: ['live_check'] });
  for (const r of (Array.isArray(rows) ? rows : rows?.entities ?? [])) {
    if (r.data?.title === title) await window.pt.delete(r.id);
  }
}, probe);

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} failed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log('\nlive runtime verified');
