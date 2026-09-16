import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const dist = path.resolve('dist');
const entries = await readdir(dist, { withFileTypes: true });
const names = entries.map((entry) => entry.name);
const errors = [];

if (!names.includes('index.html')) errors.push('dist/index.html is missing');
if (entries.some((entry) => entry.isDirectory())) {
  errors.push('dist contains nested directories; PrimeThink deploys top-level files only');
}
if (!names.some((name) => name.endsWith('.js'))) errors.push('dist has no JavaScript bundle');
if (!names.some((name) => name.endsWith('.css'))) errors.push('dist has no CSS bundle');

if (names.includes('index.html')) {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  if (/(?:src|href)=["']\/(?!\/)/.test(html)) {
    errors.push('dist/index.html contains a root-absolute asset URL');
  }
}

// ---------------------------------------------------------------------------
// Artifact-level platform checks.
//
// These read the BUILT output rather than the source, which is the only place
// they are decidable: a remote font can arrive from JS, CSS or HTML, and whether
// a utility class produced any CSS is a fact about the emitted stylesheet, not
// about the markup that references it.
// ---------------------------------------------------------------------------

const read = async (name) => readFile(path.join(dist, name), 'utf8');
const textFiles = names.filter((n) => /\.(html|js|css)$/.test(n));
const cssFiles = names.filter((n) => n.endsWith('.css'));

// A font fetched from a CDN sits behind the host's CSP and may run offline: it
// fails silently and the app falls back to a system font mid-layout.
const CDN_FONT = /https?:\/\/[^"'`\s)]*(?:fonts\.(?:googleapis|gstatic)\.com|\.woff2?\b)/;
for (const name of textFiles) {
  const match = (await read(name)).match(CDN_FONT);
  if (match) {
    errors.push(
      `${name} fetches a font from a remote origin (${match[0].slice(0, 60)}). ` +
        'Bundle it instead — @fontsource/<face>/latin-<weight>.css emits flat .woff2 files into dist/.'
    );
  }
}

// App Studio mock-screen tokens read `--pt-*` custom properties that exist only
// inside App Studio's host shell. Pasted into a compiled app they generate no CSS,
// and Tailwind is silent about it — the element renders transparent or borderless
// with no error anywhere.
//
// The check is against the EMITTED CSS, not the markup. A project that defines these
// names itself (an `@theme inline` block mapping them onto its own variables) emits
// real rules and passes — which is the whole point, and is what the previous
// source-scanning version got wrong.
const PT_MOCK_TOKENS = [
  'on-surface-variant', 'on-surface', 'on-primary-container', 'on-primary',
  'primary-container', 'outline-variant', 'outline', 'scaffold', 'surface'
];
const PREFIXES = 'bg|text|border|ring|divide|fill|stroke|from|via|to|accent|caret|decoration|placeholder|shadow|outline';

if (cssFiles.length) {
  const css = (await Promise.all(cssFiles.map(read))).join('\n');
  const undefined_ = new Set();
  const referenced = new RegExp(`\\b(?:${PREFIXES})-(?:${PT_MOCK_TOKENS.join('|')})\\b`, 'g');
  // Tailwind emits `.bg-surface{…}` for a plain utility, but escapes the colon in a
  // variant: `md:text-on-surface` ships as `.md\:text-on-surface`. A plain
  // `css.includes('.' + utility)` therefore MISSES every variant form and fails the
  // build on a correctly defined token — so match the utility where it is preceded by
  // the selector dot OR by an escaped variant separator, and not glued to a longer name.
  const emitted = (utility) =>
    new RegExp(String.raw`[.\\:]${utility.replace(/[^\w-]/g, '\\$&')}(?![\w-])`).test(css);

  for (const name of textFiles.filter((n) => !n.endsWith('.css'))) {
    for (const [utility] of (await read(name)).matchAll(referenced)) {
      if (!emitted(utility)) undefined_.add(utility);
    }
  }
  if (undefined_.size) {
    const list = [...undefined_];
    errors.push(
      'these App Studio mock-screen utilities are referenced but Tailwind emitted no CSS for them, ' +
        `so they render as nothing: ${list.slice(0, 6).join(', ')}` +
        `${list.length > 6 ? ` (+${list.length - 6} more)` : ''}. ` +
        'Define them in an @theme inline block backed by your own CSS variables, or use the standard palette.'
    );
  }
}

if (errors.length) {
  console.error('PrimeThink build verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`PrimeThink build verified: ${names.length} flat, relative deployable files in dist/`);
