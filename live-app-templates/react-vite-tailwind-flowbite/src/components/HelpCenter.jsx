/**
 * HelpCenter — in-app help for a PrimeThink Live App.
 *
 * REUSABLE: this file is generic. It depends only on `Modal.jsx` (for its `size` prop)
 * and the template's `--pt-*` token classes. Supply your own `sections` and nothing here
 * needs touching.
 *
 * WHY HELP BELONGS IN THE APP
 * ---------------------------
 * A Live App is an ordinary HTML document in an iframe, so it renders identically on web,
 * desktop and PWA, can play video inline, and can carry real navigation and search. Help
 * put anywhere else in the chat chrome gets none of that, and is easy to miss besides.
 *
 * It is a dialog behind a button, never a panel in the workspace: an always-visible
 * welcome card or "How it works" block above the primary content is the thing the design
 * guidance forbids.
 *
 * CONTENT CONTRACT
 * ----------------
 *   sections: [{
 *     id:       'searches',          // stable; also the deep-link target
 *     title:    'Searches',
 *     summary:  'one line for the index',
 *     keywords: 'extra words the search should match',   // optional
 *     video:    { src: './searches.mp4', poster: './searches.jpg', seconds: 97 }, // optional
 *     body:     <>…JSX…</>           // React, so it is escaped and needs no parser
 *   }]
 *
 * Video sources must be RELATIVE: they resolve against the
 * `<base href="/api/v1/live/{chat}/app/">` the platform injects, so each chat serves its
 * own copy and nothing pins a document id. Keep the files in `public/`.
 *
 * Open it at a specific topic with `initialSectionId` — that is how an empty state offers
 * contextual help without a second component.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import Modal from './Modal.jsx';

const fold = (value) =>
  String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/**
 * A video inside a help section. `preload="metadata"` is deliberate: a help centre may
 * carry several videos and without it a browser can start pulling all of them at once.
 * Sources are RELATIVE, so they resolve against the injected
 * `<base href="/api/v1/live/{chat}/app/">` and each chat serves its own copy.
 */
export function HelpVideo({ src, poster, seconds }) {
  return (
    <figure className="mb-4">
      <video className="w-full rounded-lg border border-[var(--pt-hairline)]" src={src} poster={poster} controls preload="metadata">
        Your browser cannot play this video.{' '}
        <a href={src} className="underline">Download it</a>.
      </video>
      {seconds ? (
        <figcaption className="mt-1 text-xs text-[var(--pt-muted)] tabular-nums">{mmss(seconds)}</figcaption>
      ) : null}
    </figure>
  );
}

export default function HelpCenter({ open, onClose, sections, title = 'Help', initialSectionId }) {
  const first = sections[0]?.id;
  const [activeId, setActiveId] = useState(initialSectionId || first);
  const [query, setQuery] = useState('');
  // Narrow screens show one pane at a time: the list, or the chosen section.
  const [showList, setShowList] = useState(!initialSectionId);
  const bodyRef = useRef(null);

  // Re-open at the requested topic rather than wherever it was left.
  useEffect(() => {
    if (!open) return;
    setActiveId(initialSectionId || first);
    setShowList(!initialSectionId);
    setQuery('');
  }, [open, initialSectionId, first]);

  const matches = useMemo(() => {
    const q = fold(query).trim();
    if (!q) return sections;
    return sections.filter((s) =>
      fold(`${s.title} ${s.summary || ''} ${s.keywords || ''}`).includes(q));
  }, [sections, query]);

  const active = sections.find((s) => s.id === activeId) || sections[0];

  // Open each topic at its top. Beside the list the section scrolls on its own, but
  // on a phone it is the Modal body that scrolls, so reset that container too —
  // otherwise a topic picked low in a long index opens part-way down.
  useEffect(() => {
    const body = bodyRef.current;
    if (!open || showList || !body) return;
    body.scrollTop = 0;
    for (let el = body.parentElement; el && el !== document.body; el = el.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) {
        el.scrollTop = 0;
        break;
      }
    }
  }, [open, activeId, showList]);

  const choose = (id) => {
    setActiveId(id);
    setShowList(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--pt-hairline)] px-3 py-2 text-sm font-medium text-[var(--pt-on-surface)] hover:bg-[var(--pt-hover)] focus:outline-hidden focus:ring-2 focus:ring-[var(--pt-focus)]"
        >
          Close
        </button>
      }
    >
      <div className="sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-5">
        {/* Index */}
        <nav aria-label="Topics" className={`${showList ? 'block' : 'hidden'} sm:block`}>
          <label htmlFor="help-search" className="mb-1 block text-xs font-medium text-[var(--pt-muted)]">
            Search
          </label>
          <input
            id="help-search"
            type="search"
            value={query}
            placeholder="Search the help…"
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--pt-hairline)] bg-[var(--pt-surface)] px-3 py-2 text-sm text-[var(--pt-on-surface)] placeholder:text-[var(--pt-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--pt-focus)]"
          />
          <ul className="mt-3 space-y-1">
            {matches.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => choose(section.id)}
                  aria-current={section.id === active?.id ? 'true' : undefined}
                  className={[
                    'w-full rounded-lg px-3 py-2 text-left transition-colors duration-150',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--pt-focus)]',
                    section.id === active?.id
                      ? 'bg-[var(--pt-hover)] font-medium text-[var(--pt-on-surface)]'
                      : 'text-[var(--pt-on-surface)] hover:bg-[var(--pt-hover)]'
                  ].join(' ')}
                >
                  <span className="block text-sm font-medium">{section.title}</span>
                  {section.summary ? (
                    <span className="mt-0.5 block text-xs text-[var(--pt-muted)]">{section.summary}</span>
                  ) : null}
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--pt-muted)]">No topic matches “{query}”.</li>
            ) : null}
          </ul>
        </nav>

        {/* Section */}
        <article
          ref={bodyRef}
          className={`${showList ? 'hidden' : 'block'} sm:block sm:max-h-[60vh] sm:overflow-y-auto sm:pr-1`}
        >
          <button
            type="button"
            onClick={() => setShowList(true)}
            className="mb-3 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-[var(--pt-on-surface)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--pt-focus)] sm:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12.7 15.3 7.4 10l5.3-5.3 1.4 1.4L10.2 10l3.9 3.9z" />
            </svg>
            All topics
          </button>

          {active ? (
            <>
              <h3 className="mb-3 text-base font-semibold text-[var(--pt-on-surface)]">{active.title}</h3>
              {active.video ? <HelpVideo {...active.video} /> : null}
              <div className="help-body max-w-prose text-sm text-[var(--pt-on-surface)]">{active.body}</div>
            </>
          ) : null}
        </article>
      </div>
    </Modal>
  );
}
