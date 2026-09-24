# AGENTS.md — invariants for this PrimeThink Live App template

Rules that hold for every app built from `react-vite-tailwind-flowbite`. Each one
exists because it already broke a shipped app. `npm run build` enforces most of
them (ESLint, including the PrimeThink platform rules in `eslint-rules/primethink.js`,
plus `scripts/verify-dist.mjs`); the rest are on you.

## 1. Preserve the theme bridge verbatim

The inline `<script>` in `index.html` is a template invariant. Do not simplify it,
do not move it below the stylesheet, do not replace it with a React effect. It
must keep all three sources, in this order:

1. `?theme=` on `location.search` — only present on direct/standalone access.
2. **The `dark` / `light` class already on `<html>`** — injected by PrimeThink's
   server. The app runs in an **iframe**, so `location.search` does NOT carry the
   parent page's query params; this class is the reliable signal.
3. OS `prefers-color-scheme` — last resort only.

Plus the `pt:theme` `postMessage` listener, for live theme switches while the app
is open. `scripts/check-template-drift.mjs` (repo root) fails if this block drifts
away from the other templates.

## 2. flowbite-react 0.12 — flat exports, and never its Modal

- Flat exports only: `ModalHeader`, `TableCell`, `ToastToggle`. Dot-notation
  (`Modal.Header`, `Table.Cell`) is the legacy API and renders as `undefined`.
- **Never import `Modal` from `flowbite-react`.** It uses `@floating-ui/react`,
  which crashes at runtime under React 19 — with no build-time warning. Use
  `src/components/Modal.jsx` (portal + Tailwind) instead. Every other
  flowbite-react component (Button, TextInput, Badge, Spinner, Table…) is fine.

## 3. No `localStorage` / `sessionStorage`

Persist through the chat database: `pt.add()`, `pt.edit()`, `pt.list()`. Web
storage is per-browser, invisible to other users and to the AI, and can be
unavailable in the sandboxed iframe.

**One exception, in tests only:** `tests/pt-stub.mjs` persists to `sessionStorage` so a
browser test can assert `add -> reload -> re-assert`. That is test scaffolding running
against `vite preview`, never shipped app code — the rule above is about where your
app's data lives, and the answer there is always ChatDB.

## 4. Colour — pick one of two strategies and hold to it

A compiled Live App ships its own CSS, and **Tailwind v4 silently emits nothing
for a utility it does not recognise**. An invented color class is therefore not
an error anywhere — it is simply no style at all: a transparent, borderless box.

**Never use the App Studio mock-screen tokens** — `bg-scaffold`, `bg-surface`,
`text-on-surface`, `text-on-surface-variant`, `border-outline`,
`border-outline-variant`, `bg-primary-container`, `text-on-primary` and friends.
Those are a **mock-screen convention that only exists inside App Studio's host
shell**, which defines the backing `--pt-*` custom properties. Nothing defines them
in a compiled app, so Tailwind emits zero CSS and the element renders transparent or
borderless with no error anywhere. `verify-dist` fails the build if one of these
utilities is referenced in the built output with no matching rule in the emitted CSS.

Note the check is against the **emitted CSS**, not the markup: if you define these
names yourself — see the token contract below — they compile to real rules and the
build passes. The failure is "referenced but undefined", not "this name is banned".

You have two ways to colour a compiled Live App.

**Either** the standard Tailwind palette with an explicit `dark:` variant on every
color utility:

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                border border-gray-200 dark:border-gray-700">
  <button className="focus:outline-hidden focus:ring-2 focus:ring-blue-500">…</button>
</div>
```

Dark mode is driven by the `dark` class the theme bridge (§1) puts on `<html>` —
see `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`. A color
without a `dark:` partner just stays light when the host switches to dark.

**Or** a variable-backed token contract with `@theme inline`, which is usually the
better choice for an app with a real palette. Define the variables once per mode and
map Tailwind colour names onto them:

```css
:root       { --app-surface: #FFFFFF; --app-ink: #1D1E2C; }
:root.dark  { --app-surface: #1B222B; --app-ink: #ECF1F5; }

@theme inline {
  --color-surface: var(--app-surface);
  --color-ink:     var(--app-ink);
}
```

`bg-surface` and `text-ink` then flip on their own with the host theme, and the app
needs **no `dark:` variants at all**. Note this is `@theme inline` — a plain `@theme`
block with literal hex values produces a static colour that cannot flip, which forces
`dark:` back onto every utility.

Pick one and hold to it. Retrofitting a token contract across finished components is
the expensive order; deciding it before the first component costs nothing.

Tailwind v4 note: the focus-ring reset is `outline-hidden`, not v3's
`outline-none`.

### Three ways a colour silently does nothing

All three pass lint, build and `verify-dist`, and are visible only in a screenshot.

**A token and a palette utility on the same element race, and alphabetical order
wins.** Tailwind emits colour utilities alphabetically, so `bg-card` beats `bg-white`
(`c` < `w`) and `bg-slate` would lose to it. Nothing warns you. Do not put both on one
element and rely on the order — remove the palette class. The shipped primitives carry
no palette at all for exactly this reason (see §9).

**A token can shadow a real Tailwind utility.** Name a colour `right` and `@theme
inline` generates `text-right` and `bg-right` — which already mean `text-align: right`
and `background-position: right`. One app's alignment broke and its answers rendered
green. Never name a token after a Tailwind keyword: `right`, `left`, `center`, `top`,
`bottom`, `none`, `auto`, `full`. Prefix if in doubt (`--color-mark-right`).

**An undefined token emits nothing.** Covered above — this is the inverse case, and
`verify-dist` does catch it for the App Studio mock-screen names.

### Fonts

Never fetch one from a remote origin; `verify-dist` fails the build on it. The system
stack is the default and usually right. If a face earns its place — a reading app
choosing Lexend, a word-discrimination app choosing Atkinson Hyperlegible — bundle it
with `@fontsource` and **import the subsets you need**:

```js
import '@fontsource/lexend/latin-400.css';   // not '@fontsource/lexend'
```

The package root pulls every script. One app shipped 21 font files out of 24, including
Vietnamese, for a UK-English audience — and each file is a separate upload at publish
time.

## 5. The AI-from-app pattern

Always: hidden message → wait → `response.message` → robust JSON extraction →
**user-visible error on failure**.

```js
import { askAIJson, extractJson } from './lib/pt-ai.js';

const rows = await askAIJson(prompt, { schemaHint: '[{"name": string}]' });
if (!Array.isArray(rows) || rows.length === 0) {
  showError('Could not read that. Please try again.'); // never fail silently
}
```

Hand-rolled equivalent, if you must:

```js
const result = await pt.addMessage(prompt, { hidden: true });          // hidden!
const response = await pt.waitForMessageReceived(result.task_id, { timeout: 120000 });
const text = response?.message || '';        // .message — NOT .text / .content
const data = extractJson(text, null);        // from src/lib/pt-ai.js
if (!data) showError('…');                   // always tell the user
```

With files: `pt.addMessage(formData, prompt, { hidden: true })`.

Other API shapes worth not guessing:

- `pt.list({ entityNames: ['task'] })` returns a **bare array**. The
  `{ entities, count, pagination }` shape needs `returnMetadata: true`.
- `pt.onEntityChanged(callback, { entityName })` — **callback first**.

## 6. Write the acceptance tests before the UI

`tests/acceptance.test.mjs` exists in every new project. Transcribe your spec into it
FIRST, then build until it passes.

This is the one practice that separated the good build reports from the bad ones. The
agents that did it caught an error in the *spec itself*. The ones that did not shipped
defects that passed every other gate — a table cell that silently dropped `colSpan`, a
nav drawer that never returned focus, demo data whose cross-references all resolved and
were all semantically wrong. Lint and the build check that code is WELL-FORMED. Nothing
else checks that it is RIGHT.

**The rule that makes it cheap:**

> Domain logic goes in pure modules under `src/lib/`, with no `pt` in them.

Rules, scoring, validation, filtering, date maths, state transitions. Factored out, all
of it is testable in milliseconds with no stub, no mock, no browser and no running app.
Components become a thin layer that reads from `pt` and calls those functions.

That split is not theoretical: of the four reference apps in `primethink-live-apps`, the
two that wrote acceptance tests needed **no `pt` stub at all**, and the two that did not
each hand-wrote one — and the two stubs disagree with each other about the API. A
hand-written stub encodes your *belief* about the platform, so it cannot catch a wrong
belief. Prefer making the stub unnecessary.

Cite spec clauses next to assertions (`// §4.2`). When one fails later, that is how you
know whether the code is wrong or the spec moved.

**`npm test` cannot import a `.jsx` file.** It is plain Node with no transform, so it
reaches `src/lib/` and not your components. That is a constraint worth designing around
rather than fighting: it is the same pressure as the rule above. Anything you want
asserted cheaply has to be reachable without React. What is left in a component —
rendering, props, wiring — is covered by `npm run test:ui` in a real browser, where it is
worth testing anyway. If you genuinely need component unit tests, add Vitest; it shares
this project's Vite config and handles JSX natively.

Two clause types are worth writing even when they feel like overkill — both have a
worked example in the skeleton:

- **Contract.** Assert the entity names your code uses are the ones your `GOAL.md` /
  `SPECS.md` documents. These drift silently and nothing else compares them.
- **Seed integrity.** If you ship demo rows, assert the DOMAIN relationships, not just
  that referenced ids resolve. Referential integrity is not semantic correctness.

## 7. Browser tests and screenshots

`npm run test:ui` runs `tests/ui.spec.mjs` against the BUILT app via Playwright.

```
npx playwright install chromium   # once per machine — browsers are not in node_modules
npm run test:ui
npm run test:ui -- --update-snapshots
```

Playwright is a devDependency of this template. Do not resolve it by path into another
project's `node_modules`; that has happened, and it breaks for everyone else.

**The first `npm run test:ui` run FAILS by design.** Playwright writes the missing
snapshot baselines and reports the run as failed. Review the images, commit them, run
again.

**`npm run test:ui` cannot prove persistence.** `vite preview` has no `window.pt`. For
screens that need one, `tests/pt-stub.mjs` is the canonical stub — see §9. For proof,
`tests/live.mjs` loads the app the way PrimeThink serves it, against a real chat:

```
PT_API_KEY=... node tests/live.mjs <chat-uuid>
```

It asserts `pt` is injected and real, that the app renders, and that a written row
**survives a reload** — the check an app holding state in `useState` fails and every
in-memory test passes. Three separate apps shipped having never once met a real `pt`.
Run it before saying an app works.

Reach for a screenshot assertion (`toHaveScreenshot`) for anything whose failure is
visual. Two of the reported bugs were visible **only** in a screenshot — a paint effect
applied to an inline element that had no box, and a white band around a dark-mode app —
and neither raised an error anywhere. Commit the baselines, and **review them before you
do**: a baseline recorded from a broken render locks the bug in.

Keep them narrow. One screenshot per screen per theme is reviewable; one per component
is not.

`vite preview` is a static file server here, nothing more. There is no `window.pt`, so
persistence, `pt.add` / `pt.list` and real-time sync cannot be exercised in it at all —
and the missing runtime tempts you into writing defensive guards against an absence that
only exists in your harness. Use it for layout, the theme bridge, focus and keyboard
behaviour, and screenshots.

## 8. Run the linter after every edit

Vite/esbuild does **not** enforce `no-undef`; it bundles an undeclared reference
silently and the app throws at runtime. `npm run lint` after each edit — not just
before you start. `npm run build` runs it first and refuses to build on errors.

## 9. Use the primitives the template ships

`tests/pt-stub.mjs` — the canonical browser `pt` stub. Use it for rendering and flow;
never assert a platform semantic through it. It throws on any method it does not
implement rather than returning `undefined`, and persists to `sessionStorage` so
`add -> reload -> re-assert` is testable. Four apps each wrote their own divergent stub
before this existed, which is precisely the "a stub encodes your belief about the API"
problem — one shipped stub is the answer to that, not zero.

`src/components/Table.jsx` — `Table`, `THead`, `TBody`, `Tr`, `Th`, `Td`. Every one
spreads `...rest` onto its element. A hand-rolled `<td className={…}>{children}</td>`
wrapper looks complete and silently drops `colSpan`, `rowSpan`, `scope`, `headers` and
every `aria-*`, which is how an empty-state row ends up in one column instead of
spanning the table: it renders, it looks nearly right, and no gate objects.

`src/lib/pt-list.js` — `rowsOf()`, `countOf()`, `listRows()`. `pt.list()` returns a bare
array unless you pass `returnMetadata: true`, so `.entities` on the default shape is
`undefined`, which reads as "no rows" rather than as an error. Use `rowsOf()` instead of
writing the guard again.

**Both primitives carry no palette and no `dark:`.** Their colour comes from seven
`--pt-*` variables in `index.css`, so they work unchanged under either strategy in §4.
`tests/primitives.test.mjs` fails the suite if a palette colour or `dark:` creeps back in.
An `@theme inline` project repoints the variables once:

```css
:root { --pt-surface: var(--color-card); --pt-on-surface: var(--color-ink); }
```

rather than overriding the components at every call site — which is what the previous
version forced, and which loses the alphabetical race described in §4.

These are deliberately the only platform helpers here. `libraries/` in the skill is
scoped to dynamic, no-build apps; for a compiled app, domain logic belongs in pure
modules of your own beside `pt-list.js` — see §6.

## 10. `dist/` must stay flat and relative

No nested directories, no root-absolute (`/asset.js`) URLs — PrimeThink deploys
top-level files only and serves them under a chat-specific base path. Keep
`base: './'` and `assetsDir: '.'` in `vite.config.js`.
`scripts/verify-dist.mjs` enforces this and fails the build otherwise.

## Build gates

```
npm run lint       # ESLint over the whole project: no-undef, react-hooks,
                   # and the PrimeThink rules in eslint-rules/primethink.js
npm test           # acceptance tests + the PrimeThink rule fixtures (no browser)
npm run test:ui    # Playwright, against the built app
npm run build      # lint -> vite build -> verify-dist
npm run test:rules # just the fixtures for the PrimeThink rules
```

`npm run lint` covers `tests/` and `scripts/` as well as `src/` — an undeclared
reference in a test file is the same runtime crash as one in the app.

**ESLint warnings are findings, not noise, and the build enforces that** — both
`lint` and `build` run with `--max-warnings 0`, so a warning fails them exactly
like an error. `react-hooks/exhaustive-deps` in particular is usually a
state-lifetime bug rather than a style nit: a dependency listed that should not be
there often means state is surviving a transition that should have reset it. Fix
the dependency array; reach for a narrowly scoped `eslint-disable-next-line` with
a written reason only when you have established the dependency genuinely does not
belong.

**The PrimeThink rules have their own fixtures** in
`eslint-rules/primethink.test.mjs`. If you change a rule, add the case first. The
`valid` blocks carry most of the weight: these rules replaced regexes that fired
on correct code, and a linter that is wrong on correct code teaches you to reach
for the suppression comment — which is when the true positives start getting
waved through too.
