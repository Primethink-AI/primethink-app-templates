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
 * start getting waved through too. That principle sets the bias throughout this file:
 * where the AST cannot decide, the rule stays silent.
 *
 * Two consequences of that bias are worth stating, because they are easy to undo:
 *
 *   - Identity comes from ESLint's scope analysis, never from identifier TEXT. A
 *     parameter named `pt`, a shadowed `window`, or a second `res` in a nested function
 *     are different bindings, and these rules are registered as `error` under
 *     `--max-warnings 0`, so a name collision would fail somebody's build outright.
 *   - A value is reported only when its shape is PROVEN. A flag behind a variable, a
 *     spread, or a computed expression is unknowable at lint time and stays silent.
 *
 * The artifact-level checks (a CDN font, a utility class that emitted no CSS) are not
 * here — they belong in `scripts/verify-dist.mjs`, which inspects what actually
 * shipped rather than guessing from source.
 *
 * Every rule below is covered by `primethink.test.mjs` (`npm run test:rules`), which
 * asserts the silent cases as hard as the reported ones.
 */

/** Objects that carry the platform globals. `pt` is injected onto `window`. */
const GLOBAL_OBJECTS = new Set(['window', 'globalThis', 'self']);

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression'
]);

/**
 * Property name of a MemberExpression, for both `a.b` and `a['b']`.
 * Returns undefined for a genuinely dynamic key, which keeps every caller quiet.
 */
const memberName = (node) => {
  if (node?.type !== 'MemberExpression') return undefined;
  if (!node.computed) return node.property.type === 'Identifier' ? node.property.name : undefined;
  return node.property.type === 'Literal' && typeof node.property.value === 'string'
    ? node.property.value
    : undefined;
};

/** Unwrap `await x` so the tracking below sees the call itself. */
const unwrapAwait = (node) => (node?.type === 'AwaitExpression' ? node.argument : node);

/** An object literal property whose key is `name`, if present. */
const propOf = (objectExpression, name) =>
  objectExpression?.type === 'ObjectExpression'
    ? objectExpression.properties.find(
        (p) => p.type === 'Property' && !p.computed && (p.key.name ?? p.key.value) === name
      )
    : undefined;

/** A spread makes an object literal undecidable — the missing key may arrive at runtime. */
const hasSpread = (objectExpression) =>
  objectExpression?.type === 'ObjectExpression' &&
  objectExpression.properties.some((p) => p.type === 'SpreadElement');

/**
 * Scope-aware helpers, built once per rule execution.
 *
 * Everything here keys off ESLint's resolved bindings rather than identifier text.
 * `pt` and `window` are ordinary names: a parameter called `pt`, or a local `window`
 * in a test helper, must not drag unrelated code into these rules.
 */
const analysis = (context) => {
  const sourceCode = context.sourceCode;

  /** The binding an identifier reference resolves to, or null when it is a global. */
  const variableOf = (identifier) => {
    if (identifier?.type !== 'Identifier') return null;
    for (let scope = sourceCode.getScope(identifier); scope; scope = scope.upper) {
      const ref = scope.references.find((r) => r.identifier === identifier);
      if (ref) return ref.resolved;
    }
    return null;
  };

  /**
   * Is this identifier the ambient global of that name, rather than a local of the
   * same spelling? An unresolved reference is a global too (`no-undef` owns that case);
   * a binding declared anywhere in the file is not.
   */
  const isGlobal = (identifier, name) => {
    if (identifier?.type !== 'Identifier' || identifier.name !== name) return false;
    const variable = variableOf(identifier);
    return variable === null || (variable.defs.length === 0 && variable.scope.type === 'global');
  };

  /** Does this expression evaluate to the injected platform global? */
  const isPtReceiver = (node) =>
    isGlobal(node, 'pt') ||
    (node?.type === 'MemberExpression' &&
      memberName(node) === 'pt' &&
      node.object.type === 'Identifier' &&
      GLOBAL_OBJECTS.has(node.object.name) &&
      isGlobal(node.object, node.object.name));

  /** Method name of a `pt.<name>()` / `window.pt.<name>()` call, else undefined. */
  const ptMethod = (node) => {
    if (node?.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') return undefined;
    if (!isPtReceiver(node.callee.object)) return undefined;
    return memberName(node.callee);
  };

  const isPtCall = (node, name) => {
    const method = ptMethod(node);
    return method !== undefined && (name === undefined || method === name);
  };

  /** The `pt.<name>()` call a member expression reads DIRECTLY off, as in `(await pt.list()).entities`. */
  const directPtCall = (memberNode, name) => {
    const object = unwrapAwait(memberNode.object);
    return isPtCall(object, name) ? object : undefined;
  };

  return { sourceCode, variableOf, isPtCall, ptMethod, directPtCall };
};

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
      const { sourceCode, variableOf, isPtCall, directPtCall } = analysis(context);
      const awaited = new Set();
      const pending = [];

      const report = (node, prop) =>
        context.report({
          node,
          message: `The AI reply is on \`.message\`, not \`.${prop}\` — which is undefined and reads as an empty response.`
        });

      const track = (target, value, declarator) => {
        if (!isPtCall(unwrapAwait(value), 'waitForMessageReceived')) return;
        if (target.type === 'Identifier') {
          const variable = declarator
            ? sourceCode.getDeclaredVariables(declarator)[0]
            : variableOf(target);
          if (variable) awaited.add(variable);
        } else if (target.type === 'ObjectPattern') {
          // const { text } = await pt.waitForMessageReceived() — decidable on the spot.
          for (const p of target.properties) {
            const key = p.type === 'Property' && !p.computed ? (p.key.name ?? p.key.value) : undefined;
            if (key === 'text' || key === 'content') report(p, key);
          }
        }
      };

      return {
        VariableDeclarator(node) {
          track(node.id, node.init, node);
        },
        AssignmentExpression(node) {
          if (node.operator === '=') track(node.left, node.right, null);
        },
        MemberExpression(node) {
          const prop = memberName(node);
          if (prop !== 'text' && prop !== 'content') return;
          // `(await pt.waitForMessageReceived()).text` — no variable involved at all.
          if (directPtCall(node, 'waitForMessageReceived')) {
            report(node, prop);
            return;
          }
          if (node.object.type !== 'Identifier') return;
          // Deferred: the assignment that makes this a response may sit further down.
          pending.push({ node, variable: variableOf(node.object), prop });
        },
        'Program:exit'() {
          for (const entry of pending) {
            if (entry.variable && awaited.has(entry.variable)) report(entry.node, entry.prop);
          }
        }
      };
    }
  },

  /**
   * `pt.onEntityChanged(callback, options)` — callback FIRST. Passing the entity name
   * first throws "callback must be a function" and real-time sync silently never starts.
   *
   * Only the shapes that CANNOT be a function are reported. Anything else — a call
   * returning a handler, a conditional, a member access — is left alone.
   */
  'on-entity-changed-arg-order': {
    meta: {
      type: 'problem',
      docs: { description: 'pt.onEntityChanged takes the callback as its first argument' },
      schema: []
    },
    create(context) {
      const { isPtCall } = analysis(context);
      const NEVER_A_FUNCTION = new Set(['TemplateLiteral', 'ObjectExpression', 'ArrayExpression']);
      return {
        CallExpression(node) {
          if (!isPtCall(node, 'onEntityChanged')) return;
          const first = node.arguments[0];
          if (!first) return;
          // Every Literal is impossible here, including `null` and a regex — ESTree gives
          // both `typeof value === 'object'`, so a value test would let them through.
          if (first.type !== 'Literal' && !NEVER_A_FUNCTION.has(first.type)) return;
          context.report({
            node: first,
            message:
              'pt.onEntityChanged takes the CALLBACK first: pt.onEntityChanged((event) => {…}, { entityName: "…" }). ' +
              'Passing the entity name first throws "callback must be a function" and sync never starts.'
          });
        }
      };
    }
  },

  /**
   * `pt.list()` returns a BARE ARRAY unless `returnMetadata: true`, in which case it
   * returns `{ entities, count, pagination }`.
   *
   * This fires only on a `.entities` read of a result we can PROVE asked for no
   * metadata. Options passed through a variable or a spread are undecidable, so they
   * stay silent, and a binding assigned more than one shape is dropped entirely.
   * The documented dual-shape guard — `Array.isArray(x) ? x : x?.entities` — is allowed,
   * because it is the safe form, not a misuse.
   */
  'list-entities-without-metadata': {
    meta: {
      type: 'problem',
      docs: { description: 'pt.list() returns an array unless returnMetadata: true' },
      schema: []
    },
    create(context) {
      const { sourceCode, variableOf, isPtCall, directPtCall } = analysis(context);
      /** Bindings proven to hold a metadata-free pt.list() result. */
      const bare = new Set();
      /** Bindings we cannot pin to one shape — never reported. */
      const ambiguous = new Set();
      const pending = [];

      const MESSAGE =
        'pt.list() returns a bare array here, so `.entities` is undefined. Use the result directly, ' +
        'pass { returnMetadata: true } if you need count/pagination, or guard with ' +
        'Array.isArray(x) ? x : x?.entities ?? [].';

      /**
       * Does this `pt.list(options)` call return a bare array?
       *
       * true = provably bare, false = provably the metadata object, undefined = cannot
       * tell, which is reported as nothing. The SDK branches on
       * `options.returnMetadata === true` (primethink.js:1684), a STRICT comparison, so
       * any literal other than `true` — including a truthy one like 1 — still yields
       * a bare array.
       */
      const returnsBareArray = (call) => {
        const options = call.arguments[0];
        if (!options) return true; // pt.list() — no options at all
        // A variable or a spread: the flag may well be in there, and we cannot look.
        if (options.type !== 'ObjectExpression' || hasSpread(options)) return undefined;
        const prop = propOf(options, 'returnMetadata');
        if (prop === undefined) return true;
        if (prop.value.type !== 'Literal') return undefined; // computed flag
        return prop.value.value !== true;
      };

      /**
       * `Array.isArray(<the same binding>)`, allowing for negation.
       * Returns 'positive', 'negative', or null when it does not test this binding.
       */
      const isArrayTestOf = (test, variable) => {
        let node = test;
        let negated = false;
        while (node.type === 'UnaryExpression' && node.operator === '!') {
          negated = !negated;
          node = node.argument;
        }
        if (node.type !== 'CallExpression') return null;
        const callee = node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.object.type !== 'Identifier' ||
          callee.object.name !== 'Array' ||
          memberName(callee) !== 'isArray'
        ) {
          return null;
        }
        const arg = node.arguments[0];
        if (!arg || arg.type !== 'Identifier' || variableOf(arg) !== variable) return null;
        return negated ? 'negative' : 'positive';
      };

      /**
       * Is this `.entities` read on the branch where the array case is already excluded?
       *
       * It is not enough for an `Array.isArray` to appear somewhere in an enclosing
       * conditional: `flag ? result.entities : Array.isArray(other)` tests a different
       * value on a different branch and guards nothing.
       */
      const isGuarded = (node, variable) => {
        if (!variable) return false;
        for (let child = node, p = node.parent; p; child = p, p = p.parent) {
          if (FUNCTION_TYPES.has(p.type)) return false;
          if (p.type === 'ConditionalExpression') {
            const polarity = isArrayTestOf(p.test, variable);
            if (polarity === 'positive' && child === p.alternate) return true;
            if (polarity === 'negative' && child === p.consequent) return true;
          }
          if (p.type === 'LogicalExpression' && child === p.right) {
            const polarity = isArrayTestOf(p.left, variable);
            if (p.operator === '&&' && polarity === 'negative') return true;
            if (p.operator === '||' && polarity === 'positive') return true;
          }
        }
        return false;
      };

      const track = (target, value, declarator) => {
        if (target.type !== 'Identifier') return;
        const variable = declarator ? sourceCode.getDeclaredVariables(declarator)[0] : variableOf(target);
        if (!variable) return;
        const init = unwrapAwait(value);
        if (!init || !isPtCall(init, 'list')) {
          // Reassigned to something we know nothing about: the shape is no longer ours.
          if (bare.has(variable)) ambiguous.add(variable);
          return;
        }
        if (returnsBareArray(init) === true) bare.add(variable);
        else ambiguous.add(variable);
      };

      return {
        VariableDeclarator(node) {
          track(node.id, node.init, node);
        },
        AssignmentExpression(node) {
          if (node.operator === '=') track(node.left, node.right, null);
        },
        MemberExpression(node) {
          if (memberName(node) !== 'entities') return;
          // `(await pt.list()).entities` — no variable involved at all.
          const direct = directPtCall(node, 'list');
          if (direct) {
            if (returnsBareArray(direct) === true) context.report({ node, message: MESSAGE });
            return;
          }
          if (node.object.type !== 'Identifier') return;
          const variable = variableOf(node.object);
          if (isGuarded(node, variable)) return;
          // Deferred: a later reassignment can still make this binding ambiguous.
          pending.push({ node, variable });
        },
        'Program:exit'() {
          for (const entry of pending) {
            if (!entry.variable) continue;
            if (!bare.has(entry.variable) || ambiguous.has(entry.variable)) continue;
            context.report({ node: entry.node, message: MESSAGE });
          }
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
            if (spec.type !== 'ImportSpecifier') continue;
            const name = spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value;
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
   * viewers and to the AI, and can be unavailable entirely.
   *
   * The one documented exception is the device-local theme preference under the
   * `pt-theme` key (see `libraries/pt-theme.js`), so the allowance is keyed on the
   * literal key rather than on a file-level suppression — a whole-file exemption would
   * also wave through every other write in the same file.
   */
  'no-web-storage': {
    meta: {
      type: 'problem',
      docs: { description: 'persist through ChatDB, not localStorage/sessionStorage' },
      schema: [
        {
          type: 'object',
          properties: { allowedKeys: { type: 'array', items: { type: 'string' } } },
          additionalProperties: false
        }
      ]
    },
    create(context) {
      const { variableOf } = analysis(context);
      const STORAGES = new Set(['localStorage', 'sessionStorage']);
      // Only these take a key. `clear()` ignores its arguments and wipes everything,
      // so `localStorage.clear('pt-theme')` must never read as the theme exception.
      const KEYED_METHODS = new Set(['getItem', 'setItem', 'removeItem']);
      const allowedKeys = new Set(context.options[0]?.allowedKeys ?? ['pt-theme']);

      const isGlobalNamed = (identifier, name) => {
        if (identifier?.type !== 'Identifier' || identifier.name !== name) return false;
        const variable = variableOf(identifier);
        return variable === null || (variable.defs.length === 0 && variable.scope.type === 'global');
      };

      /**
       * Does this expression evaluate to web storage? Both the bare binding and the
       * `window.`-qualified form, which is what code written to run outside the host uses.
       */
      const storageName = (node) => {
        if (node?.type === 'Identifier' && STORAGES.has(node.name) && isGlobalNamed(node, node.name)) {
          return node.name;
        }
        if (
          node?.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          GLOBAL_OBJECTS.has(node.object.name) &&
          isGlobalNamed(node.object, node.object.name)
        ) {
          const name = memberName(node);
          if (name && STORAGES.has(name)) return name;
        }
        return undefined;
      };

      return {
        MemberExpression(node) {
          const storage = storageName(node.object);
          if (!storage) return;
          // `<storage>.getItem('pt-theme')` and friends — the documented exception.
          const call = node.parent;
          if (call?.type === 'CallExpression' && call.callee === node && KEYED_METHODS.has(memberName(node))) {
            const key = call.arguments[0];
            if (key?.type === 'Literal' && allowedKeys.has(key.value)) return;
          }
          context.report({
            node,
            message:
              `${storage} is per-browser: invisible to other viewers and to the AI, and it can be ` +
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
   * The contract is literally `true`: the SDK sends `finalOptions.hidden || false`
   * (primethink.js:2144), so `null`, `0` and `''` all ship a VISIBLE message while
   * reading as an attempt to hide one. Runtime-dependent values are left alone, which
   * is the case that forced a file-level suppression into the template's own pt-ai.js.
   */
  'add-message-hidden': {
    meta: {
      type: 'problem',
      docs: { description: 'app-driven pt.addMessage calls should pass { hidden: true }' },
      schema: []
    },
    create(context) {
      const { isPtCall } = analysis(context);
      return {
        CallExpression(node) {
          if (!isPtCall(node, 'addMessage')) return;
          const last = node.arguments[node.arguments.length - 1];
          if (!last || last.type !== 'ObjectExpression') return; // variable/spread: not decidable
          if (hasSpread(last)) return;
          const hidden = propOf(last, 'hidden');
          if (hidden) {
            if (hidden.value.type !== 'Literal') return; // runtime-dependent, stay quiet
            if (hidden.value.value === true) return;
          }
          context.report({
            node: last,
            message:
              'An app-driven pt.addMessage() needs { hidden: true } exactly — the SDK sends ' +
              '`hidden || false`, so null/0/"" all post a VISIBLE message. ' +
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
   *
   * The write must be in the updater's OWN body. A function the updater merely declares
   * — an event handler assigned to something, a callback handed to a timer — is not run
   * by StrictMode's double invocation, so reporting it would be a false positive. An
   * immediately-invoked function is run, so the walk continues through those.
   */
  'no-pt-write-in-state-updater': {
    meta: {
      type: 'problem',
      docs: { description: 'never call pt.* from inside a React state updater' },
      schema: []
    },
    create(context) {
      const { ptMethod } = analysis(context);
      const WRITES = new Set(['add', 'edit', 'delete', 'batchAdd', 'batchEdit', 'batchDelete', 'addMessage']);
      // setX(prev => …) — a lone function argument to a setter-shaped call.
      const isStateUpdater = (node) =>
        node?.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        /^set[A-Z]/.test(node.callee.name) &&
        node.arguments.length === 1 &&
        (node.arguments[0].type === 'ArrowFunctionExpression' ||
          node.arguments[0].type === 'FunctionExpression');

      return {
        CallExpression(node) {
          const method = ptMethod(node);
          if (method === undefined || !WRITES.has(method)) return;
          for (let p = node.parent; p; p = p.parent) {
            if (!FUNCTION_TYPES.has(p.type)) continue;
            const parent = p.parent;
            if (isStateUpdater(parent) && parent.arguments[0] === p) {
              context.report({
                node,
                message:
                  `pt.${method}() inside a ${parent.callee.name}() updater runs twice under ` +
                  'StrictMode, writing a duplicate row. Read the value out of state first, then write.'
              });
              return;
            }
            // An IIFE runs as part of the updater, so keep looking outward.
            if (parent?.type === 'CallExpression' && parent.callee === p) continue;
            return; // a function that is only DECLARED here: StrictMode does not run it
          }
        }
      };
    }
  }
};

export default { rules };
