/**
 * PrimeThink platform rules for Live Apps, as an ESLint plugin.
 *
 * These replace the regex-based `pt-doctor` code rules. The reason for the move is
 * not tidiness: three of pt-doctor's rules fired on correct code, because a regex
 * over raw lines cannot see the shape of an expression.
 *
 *   - `entities-without-metadata` matched `.entities` anywhere, so it flagged the
 *     dual-shape guard the skill itself prescribes.
 *   - `pt-mock-screen-token` matched nine reserved names in raw text, so it flagged
 *     `bg-surface` even in projects that define it via `@theme inline`.
 *   - `add-message-not-hidden` needed a file-level suppression inside the template's
 *     own `src/lib/pt-ai.js`, because that helper passes the flag through a variable.
 *
 * With an AST every one of those is decidable. A linter that is wrong on correct code
 * teaches you to reach for the suppression comment, which is when the true positives
 * start getting waved through too.
 *
 * The artifact-level checks (a CDN font, a utility class that emitted no CSS) are not
 * here — they belong in `scripts/verify-dist.mjs`, which inspects what actually
 * shipped rather than guessing from source.
 */

/** `pt.<name>` member call — the shape every rule below keys off. */
const isPtCall = (node, name) =>
  node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'pt' &&
  node.callee.property.type === 'Identifier' &&
  (name === undefined || node.callee.property.name === name);

/** An object literal property whose key is `name`, if present. */
const propOf = (objectExpression, name) =>
  objectExpression?.type === 'ObjectExpression'
    ? objectExpression.properties.find(
        (p) => p.type === 'Property' && !p.computed && (p.key.name ?? p.key.value) === name
      )
    : undefined;

const rules = {
  /**
   * `pt.waitForMessageReceived()` resolves an object whose AI text is on `.message`.
   * `.text` and `.content` are undefined, and read as "the AI returned nothing".
   */
  'response-message-field': {
    meta: {
      type: 'problem',
      docs: { description: 'read the AI reply from response.message, not .text/.content' },
      schema: []
    },
    create(context) {
      const awaited = new Set();
      return {
        // const response = await pt.waitForMessageReceived(...)
        VariableDeclarator(node) {
          if (
            node.init?.type === 'AwaitExpression' &&
            isPtCall(node.init.argument, 'waitForMessageReceived') &&
            node.id.type === 'Identifier'
          ) {
            awaited.add(node.id.name);
          }
        },
        MemberExpression(node) {
          if (node.computed || node.object.type !== 'Identifier') return;
          if (!awaited.has(node.object.name)) return;
          const prop = node.property.name;
          if (prop === 'text' || prop === 'content') {
            context.report({
              node,
              message:
                `The AI reply is on \`.message\`, not \`.${prop}\` — which is undefined and reads as an empty response.`
            });
          }
        }
      };
    }
  },

  /**
   * `pt.onEntityChanged(callback, options)` — callback FIRST. Passing the entity name
   * first throws "callback must be a function" and real-time sync silently never starts.
   */
  'on-entity-changed-arg-order': {
    meta: {
      type: 'problem',
      docs: { description: 'pt.onEntityChanged takes the callback as its first argument' },
      schema: []
    },
    create(context) {
      return {
        CallExpression(node) {
          if (!isPtCall(node, 'onEntityChanged')) return;
          const first = node.arguments[0];
          if (!first) return;
          const isFn =
            first.type === 'ArrowFunctionExpression' ||
            first.type === 'FunctionExpression' ||
            first.type === 'Identifier' ||
            first.type === 'MemberExpression';
          if (!isFn) {
            context.report({
              node: first,
              message:
                'pt.onEntityChanged takes the CALLBACK first: pt.onEntityChanged((event) => {…}, { entityName: "…" }). ' +
                'Passing the entity name first throws "callback must be a function" and sync never starts.'
            });
          }
        }
      };
    }
  },

  /**
   * `pt.list()` returns a BARE ARRAY unless `returnMetadata: true`, in which case it
   * returns `{ entities, count, pagination }`.
   *
   * Unlike the regex version, this only fires on a direct `.entities` read of a
   * `pt.list()` result that did NOT ask for metadata. The documented dual-shape guard
   * — `Array.isArray(x) ? x : x?.entities` — is explicitly allowed, because it is the
   * safe form, not a misuse.
   */
  'list-entities-without-metadata': {
    meta: {
      type: 'problem',
      docs: { description: 'pt.list() returns an array unless returnMetadata: true' },
      schema: []
    },
    create(context) {
      /** Results of a pt.list() call that did not request metadata. */
      const bare = new Set();

      const requestsMetadata = (call) => {
        const prop = propOf(call.arguments[0], 'returnMetadata');
        // Anything other than a literal `false` is treated as "asked for metadata",
        // so a computed flag is never reported.
        return prop !== undefined && !(prop.value.type === 'Literal' && prop.value.value === false);
      };

      /** Is this `.entities` read inside a guard that already handled the array case? */
      const isGuarded = (node) => {
        for (let p = node.parent; p; p = p.parent) {
          if (p.type === 'ConditionalExpression' || p.type === 'LogicalExpression') {
            const src = context.sourceCode.getText(p);
            if (/Array\.isArray/.test(src)) return true;
          }
          if (p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression') break;
        }
        return false;
      };

      return {
        VariableDeclarator(node) {
          const init = node.init?.type === 'AwaitExpression' ? node.init.argument : node.init;
          if (init && isPtCall(init, 'list') && !requestsMetadata(init) && node.id.type === 'Identifier') {
            bare.add(node.id.name);
          }
        },
        MemberExpression(node) {
          if (node.computed || node.property.name !== 'entities') return;
          if (node.object.type !== 'Identifier' || !bare.has(node.object.name)) return;
          if (isGuarded(node)) return;
          context.report({
            node,
            message:
              'pt.list() returns a bare array here, so `.entities` is undefined. Use the result directly, ' +
              'pass { returnMetadata: true } if you need count/pagination, or guard with ' +
              'Array.isArray(x) ? x : x?.entities ?? [].'
          });
        }
      };
    }
  },

  /**
   * flowbite-react's Modal pulls in @floating-ui/react, which is incompatible with
   * React 19 concurrent rendering. It builds cleanly and crashes when the modal opens.
   */
  'no-flowbite-modal': {
    meta: {
      type: 'problem',
      docs: { description: 'flowbite-react Modal crashes under React 19' },
      schema: []
    },
    create(context) {
      return {
        ImportDeclaration(node) {
          if (node.source.value !== 'flowbite-react') return;
          for (const spec of node.specifiers) {
            const name = spec.imported?.name;
            if (name && /^Modal[A-Za-z]*$/.test(name)) {
              context.report({
                node: spec,
                message:
                  `flowbite-react's ${name} uses @floating-ui/react and crashes at runtime under React 19 — ` +
                  'with no build-time warning. Use the template\'s portal Modal: import Modal from "./components/Modal.jsx".'
              });
            }
          }
        }
      };
    }
  },

  /**
   * Live Apps run in a sandboxed iframe. Web storage is per-browser, invisible to other
   * viewers and to the AI, and can be unavailable entirely. Theme preference is the one
   * documented exception.
   */
  'no-web-storage': {
    meta: {
      type: 'problem',
      docs: { description: 'persist through ChatDB, not localStorage/sessionStorage' },
      schema: []
    },
    create(context) {
      return {
        MemberExpression(node) {
          if (node.object.type !== 'Identifier') return;
          if (node.object.name !== 'localStorage' && node.object.name !== 'sessionStorage') return;
          context.report({
            node,
            message:
              `${node.object.name} is per-browser: invisible to other viewers and to the AI, and it can be ` +
              'unavailable entirely. Persist through ChatDB with pt.add()/pt.edit()/pt.list().'
          });
        }
      };
    }
  },

  /**
   * An app-driven AI call must pass `{ hidden: true }`, or the prompt lands in the chat
   * transcript where the user sees it.
   *
   * Only fires on an inline object literal that explicitly omits or falsifies the flag —
   * options passed through a variable are left alone, which is exactly the case that
   * forced a file-level suppression into the template's own pt-ai.js.
   */
  'add-message-hidden': {
    meta: {
      type: 'problem',
      docs: { description: 'app-driven pt.addMessage calls should pass { hidden: true }' },
      schema: []
    },
    create(context) {
      return {
        CallExpression(node) {
          if (!isPtCall(node, 'addMessage')) return;
          const last = node.arguments[node.arguments.length - 1];
          if (!last || last.type !== 'ObjectExpression') return; // variable/spread: not decidable, stay quiet
          const hidden = propOf(last, 'hidden');
          if (hidden && !(hidden.value.type === 'Literal' && hidden.value.value === false)) return;
          context.report({
            node: last,
            message:
              'An app-driven pt.addMessage() needs { hidden: true }, or the prompt appears in the chat transcript. ' +
              'Omit the options object entirely if the message is meant to be visible.'
          });
        }
      };
    }
  },

  /**
   * React StrictMode double-invokes state updaters, so a `pt` write inside one runs
   * twice and writes a duplicate row. This corrupts data rather than crashing, so
   * nothing surfaces it at runtime.
   */
  'no-pt-write-in-state-updater': {
    meta: {
      type: 'problem',
      docs: { description: 'never call pt.* from inside a React state updater' },
      schema: []
    },
    create(context) {
      const WRITES = new Set(['add', 'edit', 'delete', 'batchAdd', 'batchEdit', 'batchDelete', 'addMessage']);
      // setX(prev => …) — a lone function argument to a setter-shaped call.
      const isStateUpdater = (node) =>
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        /^set[A-Z]/.test(node.callee.name) &&
        node.arguments.length === 1 &&
        (node.arguments[0].type === 'ArrowFunctionExpression' ||
          node.arguments[0].type === 'FunctionExpression');

      return {
        CallExpression(node) {
          if (!isPtCall(node) || !WRITES.has(node.callee.property.name)) return;
          for (let p = node.parent; p; p = p.parent) {
            if (isStateUpdater(p)) {
              context.report({
                node,
                message:
                  `pt.${node.callee.property.name}() inside a ${p.callee.name}() updater runs twice under ` +
                  'StrictMode, writing a duplicate row. Read the value out of state first, then write.'
              });
              return;
            }
          }
        }
      };
    }
  }
};

export default { rules };
