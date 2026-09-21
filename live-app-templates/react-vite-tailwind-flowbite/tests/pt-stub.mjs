/**
 * The canonical browser `pt` stub — for RENDERING AND FLOW ONLY.
 *
 * ## Why this exists, given the template tells you to avoid stubs
 *
 * `AGENTS.md` §6 says to prefer making a stub unnecessary, and for DOMAIN tests that
 * is right: logic in pure `src/lib/` modules needs no platform at all. That advice
 * has no answer for BROWSER tests, though — `vite preview` has no `window.pt`, so a
 * correctly-written app renders its "no host" state and every screen is unreachable.
 *
 * The result was four apps writing four divergent stubs, which is the exact failure
 * §6 warns about: a hand-written stub encodes its author's *belief* about the API, so
 * it cannot catch a wrong belief — and four beliefs disagree. One shipped stub is the
 * answer to that, not zero.
 *
 * ## The rules that keep it honest
 *
 * 1. **Never assert a platform semantic through this.** It is not evidence about
 *    `pt`. Shapes here are copied from `primethink.js`; if they are wrong, your test
 *    passes and production breaks. Assert render, wiring and flow — nothing else.
 * 2. **It throws on any method it does not implement**, rather than returning
 *    `undefined`. A silent `undefined` is how a stub teaches you a wrong API.
 * 3. **It persists to `sessionStorage`**, so `add -> reload -> re-assert` is testable.
 *    An in-memory stub passes that check for an app holding everything in `useState`,
 *    which is the bug the check exists to catch.
 * 4. **Persistence proof still requires the real thing.** `tests/live.mjs` against a
 *    real chat is the only test that proves `pt`. See AGENTS.md §7.
 *
 * ## Use
 *
 *     import { installPtStub } from './pt-stub.mjs';
 *     test.beforeEach(async ({ page }) => { await installPtStub(page); });
 *     // seed rows for a screen:
 *     await installPtStub(page, { seed: { task: [{ title: 'Write tests' }] } });
 */

/** Serialised into the page: no imports, no closures over test-side state. */
function ptStubSource(seed, storageKey) {
  const KEY = storageKey;
  const SEED = seed;

  const read = () => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || 'null') || { rows: [], nextId: 1 };
    } catch {
      return { rows: [], nextId: 1 };
    }
  };
  const write = (db) => {
    try { sessionStorage.setItem(KEY, JSON.stringify(db)); } catch { /* private mode */ }
  };

  // Seed once per page context, not per navigation — so a reload sees what was added.
  if (sessionStorage.getItem(KEY) === null) {
    const db = { rows: [], nextId: 1 };
    for (const [entity_name, list] of Object.entries(SEED || {})) {
      for (const data of list) {
        db.rows.push({
          id: db.nextId++, entity_name, data,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
      }
    }
    write(db);
  }

  const subscribers = [];
  const notify = (action, row) => {
    for (const { cb, opts } of subscribers) {
      // Mirrors the real filter semantics: entity_name is reliable on inserts only,
      // so updated/deleted are delivered to action-filtered subscribers too.
      if (opts?.actions && !opts.actions.includes(action)) continue;
      if (opts?.entityName && action === 'inserted' && row.entity_name !== opts.entityName) continue;
      try { cb({ action, entity_id: row.id, entity_name: action === 'inserted' ? row.entity_name : undefined }); }
      catch { /* a subscriber throwing must not break the emitter */ }
    }
  };

  const notImplemented = (name) => () => {
    throw new Error(
      `pt.${name}() is not implemented by the browser test stub (tests/pt-stub.mjs). ` +
      `Assert this against a real chat in tests/live.mjs, or add it to the stub — ` +
      `but never assert platform semantics through the stub.`
    );
  };

  const pt = {
    __isTestStub: true,

    async add(entity_name, data) {
      const db = read();
      const row = {
        id: db.nextId++, entity_name, data,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      db.rows.push(row); write(db); notify('inserted', row);
      return { success: true, entity: row };
    },

    async batchAdd(entity_name, dataArray) {
      // Same two-argument signature as the real one; a single array throws there.
      if (typeof entity_name !== 'string') throw new Error('entityName must be a non-empty string');
      const out = [];
      for (const data of dataArray) out.push((await pt.add(entity_name, data)).entity);
      return { success: true, entities: out };
    },

    async get(id) {
      return read().rows.find((r) => r.id === Number(id)) || null;
    },

    // Returns a BARE ARRAY unless returnMetadata === true, like the real one.
    async list(options = {}) {
      const { entityNames, filters, limit, offset = 0, returnMetadata } = options;
      let rows = read().rows;
      if (entityNames?.length) rows = rows.filter((r) => entityNames.includes(r.entity_name));
      if (filters) {
        rows = rows.filter((r) =>
          Object.entries(filters).every(([k, v]) => JSON.stringify(r.data?.[k]) === JSON.stringify(v))
        );
      }
      const total = rows.length;
      rows = rows.slice(offset, limit ? offset + limit : undefined);
      return returnMetadata === true
        ? { entities: rows, count: total, pagination: { limit, offset, has_more: offset + rows.length < total } }
        : rows;
    },

    async edit(id, data, merge = false) {
      const db = read();
      const row = db.rows.find((r) => r.id === Number(id));
      if (!row) return { success: false };
      row.data = merge ? { ...row.data, ...data } : data;
      row.updated_at = new Date().toISOString();
      write(db); notify('updated', row);
      return { success: true, entity: row };
    },

    async delete(id) {
      const db = read();
      const i = db.rows.findIndex((r) => r.id === Number(id));
      if (i === -1) return { success: false };
      const [row] = db.rows.splice(i, 1);
      write(db); notify('deleted', row);
      return { success: true };
    },

    onEntityChanged(cb, opts) {
      if (typeof cb !== 'function') throw new Error('callback must be a function');
      const entry = { cb, opts };
      subscribers.push(entry);
      return () => {
        const i = subscribers.indexOf(entry);
        if (i !== -1) subscribers.splice(i, 1);
      };
    },

    async getChatMembers() {
      return [{ id: 1, name: 'Test User', type: 'user', is_logged_user: true, is_chat_owner: true }];
    },

    documentUrl(uuid) {
      if (!uuid || typeof uuid !== 'string') throw new Error('documentUrl(documentUuid): documentUuid must be a non-empty string');
      return `/api/v1/documents/uuid/${encodeURIComponent(uuid)}/download/stream`;
    },
  };

  // Everything else fails loudly rather than returning undefined.
  for (const name of [
    'addMessage', 'waitForMessageReceived', 'uploadFiles', 'saveDocument',
    'downloadDocuments', 'deleteDocuments', 'listDirectory', 'callToolDirect',
    'sendNotificationToUsers', 'getBaseUrl', 'batchEdit', 'batchDelete',
  ]) {
    pt[name] = notImplemented(name);
  }

  window.pt = pt;
}

/**
 * Install the stub before any app code runs.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ seed?: Record<string, object[]>, storageKey?: string }} [options]
 */
export async function installPtStub(page, options = {}) {
  const { seed = {}, storageKey = 'pt-stub-db' } = options;
  await page.addInitScript(
    ({ fn, seed, storageKey }) => {
      new Function(`return (${fn})`)()(seed, storageKey);
    },
    { fn: ptStubSource.toString(), seed, storageKey }
  );
}
