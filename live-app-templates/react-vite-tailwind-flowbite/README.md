# React + Vite + Tailwind + Flowbite Live App

An intentionally blank PrimeThink Live App canvas with a production build pipeline. `App` returns `null`: no sample interface, content, entities, colors, layout, or application behavior is predefined.

## Stack

| Package | Version |
|---|---:|
| React / ReactDOM | 19.2.8 |
| Vite | 8.2.1 |
| `@vitejs/plugin-react` | 6.0.5 |
| Tailwind CSS / `@tailwindcss/vite` | 4.3.3 |
| Flowbite | 4.0.2 |
| Flowbite React | 0.12.17 |
| `@playwright/test` (dev) | ^1.63.0 |

Vite 8 requires Node `20.19+` or `22.12+`. Versions are pinned in `package.json`, and `package-lock.json` records the transitive dependency graph.

## Commands

```bash
npm install
npx playwright install chromium   # once per machine, for npm run test:ui
npm run dev
npm test                          # acceptance tests + PrimeThink rule fixtures
npm run test:ui                   # Playwright, against the built app
npm run build                     # lint -> vite build -> verify-dist
npm run preview
```

**Start with `tests/acceptance.test.mjs`, not `src/App.jsx`.** Transcribe your spec into
it before building the UI, and keep domain logic in pure modules under `src/lib/` so it
can be tested without a browser or a `pt` stub. `AGENTS.md` §6 explains why this is the
practice that most changes the outcome.

Then build in `src/App.jsx`. Tailwind and Flowbite React are already wired through `src/index.css` and `vite.config.js`, but the blank app imports no UI components until you choose to use them.

## What the template ships beyond wiring

| Path | Purpose |
|---|---|
| `tests/acceptance.test.mjs` | Spec-driven acceptance skeleton. Write these first. |
| `tests/ui.spec.mjs` | Playwright: theme bridge, render health, screenshot baselines. |
| `src/lib/pt-list.js` | `rowsOf()` / `countOf()` / `listRows()` — `pt.list()` returns a bare array unless you pass `returnMetadata: true`. |
| `src/components/Table.jsx` | Table primitives that forward `...rest`, so `colSpan` and `aria-*` survive. |
| `src/components/Modal.jsx` | Portal modal. flowbite-react's Modal crashes under React 19. |
| `eslint-rules/primethink.js` | Seven platform rules, run as errors by `npm run lint`. |
| `scripts/verify-dist.mjs` | Artifact checks: flat relative output, no CDN fonts, no undefined `@theme` utilities. |

## PrimeThink deployment

1. Run `npm run build`.
2. Create a PrimeThink Live App with page type **HTML**.
3. Upload the **top-level files inside `dist/`**, not the source project or the `dist` directory itself.

`npm run build` creates `dist/` and runs `scripts/verify-dist.mjs`. The verifier requires flat output containing JavaScript and CSS with relative asset URLs. The Vite config preserves this through `base: './'`, `assetsDir: '.'`, and flat Rollup output names.

PrimeThink injects and initializes `window.pt` at runtime. Do not add `primethink.js` as a dependency, bundle it, add credentials, or call `pt.init()`. Use Chat DB rather than `localStorage` for persistent data, retain the host-theme bridge and class-based dark variant, and clean up any PrimeThink subscriptions you add in React effects.

## Learn how to build Live Apps

This is an intentionally blank template — it ships wiring, not an app. To build
on it, use the **primethink-developer** skill: read `SKILL.md` in your installed
skills (in the PrimeThink sandbox: `/sandbox/skills/primethink-developer/SKILL.md`).
It covers the injected `pt` API, ChatDB persistence (granular entities,
seed-if-empty demo data), app-shell layout expectations, publishing, and the
live-page refresh flow.
