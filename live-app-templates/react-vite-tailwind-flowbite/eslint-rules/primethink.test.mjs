/**
 * Rule fixtures. Run with `npm run test:rules`.
 *
 * The `valid` blocks matter more than the `invalid` ones. Every rule here replaced a
 * regex that fired on correct code, and each false positive taught whoever hit it to
 * write a suppression comment — after which the true positives got waved through too.
 * So each rule below pins the shapes that must stay SILENT, including every one that a
 * review found the first AST version getting wrong:
 *
 *   - `window.pt.*` — the template's own src/lib/pt-ai.js spelling, invisible to every
 *     rule when the receiver check only accepted the bare `pt` binding.
 *   - options passed through a variable, which cannot be inspected and must not be guessed.
 *   - a name assigned more than one result shape.
 */

import { describe, it } from 'node:test';
import { RuleTester } from 'eslint';
import plugin from './primethink.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: { pt: 'readonly', window: 'readonly', localStorage: 'readonly', sessionStorage: 'readonly' }
  }
});

const rules = plugin.rules;

// ---------------------------------------------------------------------------

ruleTester.run('response-message-field', rules['response-message-field'], {
  valid: [
    'const res = await pt.waitForMessageReceived(); use(res.message);',
    // Unrelated object: `.text` is perfectly normal everywhere else.
    'const el = document.body; use(el.text);',
    'const res = await other.waitForMessageReceived(); use(res.text);'
  ],
  invalid: [
    {
      code: 'const res = await pt.waitForMessageReceived(); use(res.text);',
      errors: 1
    },
    {
      code: 'const res = await pt.waitForMessageReceived(); use(res.content);',
      errors: 1
    },
    // window-qualified receiver — silent before the receiver fix.
    {
      code: 'const res = await window.pt.waitForMessageReceived(); use(res.text);',
      errors: 1
    },
    // Assignment rather than declaration — silent before deferred reporting.
    {
      code: 'let res; res = await pt.waitForMessageReceived(); use(res.text);',
      errors: 1
    },
    // The read sits ABOVE the assignment that defines the shape.
    {
      code: 'function f(res) { return res.text; } let res = await pt.waitForMessageReceived();',
      errors: 1
    },
    // Destructured straight out of the call.
    {
      code: 'const { text } = await pt.waitForMessageReceived();',
      errors: 1
    }
  ]
});

// ---------------------------------------------------------------------------

ruleTester.run('on-entity-changed-arg-order', rules['on-entity-changed-arg-order'], {
  valid: [
    'pt.onEntityChanged((e) => use(e), { entityName: "task" });',
    'pt.onEntityChanged(handler, { entityName: "task" });',
    'window.pt.onEntityChanged(function (e) { use(e); });',
    'pt.onEntityChanged(this.handler);',
    // A call that returns a handler is not decidable — stay quiet.
    'pt.onEntityChanged(makeHandler(), { entityName: "task" });',
    'pt.onEntityChanged(ready ? onA : onB);'
  ],
  invalid: [
    { code: 'pt.onEntityChanged("task", (e) => use(e));', errors: 1 },
    { code: 'window.pt.onEntityChanged("task", (e) => use(e));', errors: 1 },
    { code: 'pt.onEntityChanged(`task`, (e) => use(e));', errors: 1 },
    { code: 'pt.onEntityChanged({ entityName: "task" }, (e) => use(e));', errors: 1 }
  ]
});

// ---------------------------------------------------------------------------

ruleTester.run('list-entities-without-metadata', rules['list-entities-without-metadata'], {
  valid: [
    'const rows = await pt.list({ entityNames: ["task"] }); use(rows);',
    'const res = await pt.list({ entityNames: ["task"], returnMetadata: true }); use(res.entities);',
    // The dual-shape guard the skill itself prescribes.
    'const r = await pt.list({ entityNames: ["task"] }); const rows = Array.isArray(r) ? r : r?.entities ?? []; use(rows);',
    // Options through a variable: undecidable, must stay silent.
    'const opts = { returnMetadata: true }; const res = await pt.list(opts); use(res.entities);',
    // Spread: the flag may arrive at runtime.
    'const res = await pt.list({ ...base }); use(res.entities);',
    // A computed flag: decided at runtime, so neither shape is provable.
    'const res = await pt.list({ returnMetadata: wantMeta }); use(res.entities);',
    // Two shapes on one name — no single answer, so no report.
    'let r = await pt.list({}); r = await pt.list({ returnMetadata: true }); use(r.entities);',
    // Unrelated object.
    'const res = await api.fetch(); use(res.entities);'
  ],
  invalid: [
    { code: 'const res = await pt.list({ entityNames: ["task"] }); use(res.entities);', errors: 1 },
    { code: 'const res = await window.pt.list({ entityNames: ["task"] }); use(res.entities);', errors: 1 },
    { code: 'let res; res = await pt.list({}); use(res.entities);', errors: 1 },
    { code: 'const res = await pt.list(); use(res.entities);', errors: 1 },
    { code: 'const res = await pt.list({ returnMetadata: false }); use(res.entities);', errors: 1 },
    // The SDK compares `=== true`, so a merely truthy value still yields a bare array.
    { code: 'const res = await pt.list({ returnMetadata: 1 }); use(res.entities);', errors: 1 }
  ]
});

// ---------------------------------------------------------------------------

ruleTester.run('no-flowbite-modal', rules['no-flowbite-modal'], {
  valid: [
    'import { Button } from "flowbite-react";',
    'import Modal from "./components/Modal.jsx";',
    'import { Modal } from "./components/Modal.jsx";'
  ],
  invalid: [
    { code: 'import { Modal } from "flowbite-react";', errors: 1 },
    { code: 'import { ModalHeader, ModalBody } from "flowbite-react";', errors: 2 }
  ]
});

// ---------------------------------------------------------------------------

ruleTester.run('no-web-storage', rules['no-web-storage'], {
  valid: [
    'pt.add("task", { title: "x" });',
    // The one documented exception: the device-local theme preference.
    'localStorage.getItem("pt-theme");',
    'localStorage.setItem("pt-theme", "dark");',
    'window.localStorage.getItem("pt-theme");',
    { code: 'localStorage.getItem("my-key");', options: [{ allowedKeys: ['my-key'] }] }
  ],
  invalid: [
    { code: 'localStorage.setItem("rows", JSON.stringify(rows));', errors: 1 },
    // window-qualified — silent before the receiver fix, a regression against pt-doctor.
    { code: 'window.localStorage.setItem("rows", JSON.stringify(rows));', errors: 1 },
    { code: 'globalThis.sessionStorage.getItem("rows");', errors: 1 },
    { code: 'window["localStorage"].clear();', errors: 1 },
    // A non-theme key is still a violation even though the theme key is allowed.
    { code: 'localStorage.setItem("pt-rows", "[]");', errors: 1 }
  ]
});

// ---------------------------------------------------------------------------

ruleTester.run('add-message-hidden', rules['add-message-hidden'], {
  valid: [
    'pt.addMessage("hi", { hidden: true });',
    'window.pt.addMessage("hi", { hidden: true });',
    // No options object at all: the message is meant to be visible.
    'pt.addMessage("hi");',
    // Options through a variable or a spread: not decidable. This is the exact case
    // that forced a file-level suppression into the template's own src/lib/pt-ai.js.
    'pt.addMessage("hi", opts);',
    'pt.addMessage("hi", { ...opts });',
    'pt.addMessage("hi", { hidden: wantHidden });'
  ],
  invalid: [
    { code: 'pt.addMessage("hi", { stream: false });', errors: 1 },
    { code: 'window.pt.addMessage("hi", { stream: false });', errors: 1 },
    { code: 'pt.addMessage("hi", { hidden: false });', errors: 1 }
  ]
});

// ---------------------------------------------------------------------------

ruleTester.run('no-pt-write-in-state-updater', rules['no-pt-write-in-state-updater'], {
  valid: [
    'setRows((prev) => [...prev, row]); pt.add("task", row);',
    // A read inside an updater is not a write.
    'setRows((prev) => { pt.list("task"); return prev; });',
    'notSetter((prev) => { pt.add("task", row); return prev; });',
    // A setter called with a value, not an updater function.
    'setRows(pt.add("task", row));'
  ],
  invalid: [
    { code: 'setRows((prev) => { pt.add("task", row); return prev; });', errors: 1 },
    { code: 'setRows((prev) => { window.pt.add("task", row); return prev; });', errors: 1 },
    { code: 'setRows(function (prev) { pt.batchAdd("task", rows); return prev; });', errors: 1 },
    { code: 'setRows((prev) => { pt.delete("task", id); return prev; });', errors: 1 }
  ]
});
