/**
 * Acceptance tests — transcribe your spec, then make them pass.
 *
 * WRITE THESE FIRST, before the UI. In the build reports behind this template, the
 * agents that did this caught an error in the SPEC itself; the ones that did not
 * shipped bugs that every other gate passed. Lint and the build check that code is
 * well-formed. Nothing else checks that it is RIGHT.
 *
 * The rule that makes this file possible:
 *
 *   PUT DOMAIN LOGIC IN PURE MODULES UNDER src/lib/, AND KEEP `pt` OUT OF THEM.
 *
 * Rules, scoring, validation, filtering, date maths, state transitions — none of it
 * needs a browser or a platform. Factored out, it is testable here in milliseconds
 * with no stub, no mock and no running app. Components then become a thin layer that
 * reads from `pt` and calls those functions. The two apps in primethink-live-apps that
 * wrote acceptance tests needed no `pt` stub at all, precisely because of this split;
 * the two that did not each hand-wrote a stub, and the two stubs disagree with each
 * other about the API.
 *
 * Cite the spec. `// §4.2` next to an assertion is how the next person — or the next
 * model — knows whether a failure means the code is wrong or the spec changed.
 *
 *     npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { rowsOf, countOf } from '../src/lib/pt-list.js';

// ---------------------------------------------------------------------------
// Template self-checks. Delete these once your own suite has replaced them —
// but keep the shape.
// ---------------------------------------------------------------------------

describe('pt.list() result normalisation', () => {
  it('returns the array unchanged when pt.list() gave a bare array', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    assert.deepEqual(rowsOf(rows), rows);
  });

  it('unwraps .entities when the call passed returnMetadata: true', () => {
    assert.deepEqual(rowsOf({ entities: [{ id: 1 }], count: 9 }), [{ id: 1 }]);
  });

  it('gives an empty array for every empty shape, never undefined', () => {
    // An `undefined` here becomes `rows.map is not a function` three components away,
    // which is why this is the one helper the template ships.
    for (const empty of [[], {}, null, undefined, { entities: null }]) {
      assert.deepEqual(rowsOf(empty), [], `rowsOf(${JSON.stringify(empty) ?? 'undefined'})`);
    }
  });

  it('reports the total from metadata, falling back to the row count', () => {
    assert.equal(countOf({ entities: [{ id: 1 }], count: 240 }), 240);
    assert.equal(countOf([{ id: 1 }, { id: 2 }]), 2);
    assert.equal(countOf(null), 0);
  });
});

// ---------------------------------------------------------------------------
// Your spec goes below. One `describe` per spec section, one `it` per clause.
//
// describe('§3 Scoring', () => {
//   it('§3.1 awards no points for an answer given after the timer expires', () => {
//     assert.equal(score({ correct: true, elapsedMs: 31_000 }), 0);
//   });
// });
//
// Two clause types are worth writing even though they feel like overkill:
//
//   - CONTRACT. Assert that the entity names your code uses are the ones your
//     GOAL.md/SPECS.md documents. These drift silently and nothing else compares them:
//       assert.deepEqual(Object.keys(ENTITIES).sort(), [...documented].sort());
//
//   - SEED INTEGRITY. If you ship demo rows, assert the DOMAIN relationships, not just
//     that referenced ids exist. A build report had a chain-of-title discrepancy for one
//     jurisdiction attached to a case in another; every id resolved, the screen rendered
//     perfectly, and the content was nonsense. Referential integrity would not have
//     caught it:
//       SEED.discrepancies.forEach((d) => {
//         assert.equal(d.jurisdiction, caseById(d.caseId).jurisdiction, d.id);
//       });
// ---------------------------------------------------------------------------
