// The shipped primitives take every colour from the --pt-* variables in index.css, so
// they work under either colour strategy (AGENTS.md §4). A palette utility or a `dark:`
// variant quietly assumes the standard-palette one, and loses the alphabetical race
// against a token utility in an @theme inline project. Prose said this; this enforces it.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const PALETTE = /\b(?:[a-z-]+:)*(?:bg|text|border|ring|outline|fill|stroke|divide|shadow|from|via|to|accent|caret|decoration)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)\b/g;

for (const file of ['Table.jsx', 'Modal.jsx']) {
  test(`${file} uses no palette colour and no dark: variant`, () => {
    // Comments may name the rule ("never with a `dark:` variant"); only code counts.
    const src = readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    assert.deepEqual(src.match(PALETTE) ?? [], [], 'use a --pt-* variable from index.css instead');
    assert.equal(/\bdark:/.test(src), false, 'colour comes from --pt-* variables, which switch on .dark themselves');
  });
}
