/**
 * Your app's help, as data for `components/HelpCenter.jsx`.
 *
 * Replace these two sections. The component is generic; this file is the only part
 * that is about your app.
 *
 * Bodies are JSX, not Markdown: React escapes text, so there is no parser and no XSS
 * surface, and a section can hold anything your app can render.
 *
 * VIDEO is optional, and the sources must be RELATIVE (`./tour.mp4`). They resolve
 * against the `<base href="/api/v1/live/{chat}/app/">` PrimeThink injects, so each chat
 * serves its own copy and nothing pins a document id. Put the files in `public/` —
 * Vite copies that into `dist/`, so a rebuild cannot lose them. Mind the weight: the
 * media is copied into every chat created from the task.
 *
 * Keep this in step with the app. A guide describing a screen that no longer exists is
 * worse than no guide.
 */

const P = ({ children }) => <p className="mb-3">{children}</p>;
const H = ({ children }) => (
  <h4 className="mb-2 mt-4 text-sm font-semibold text-gray-900 dark:text-white">{children}</h4>
);
const UL = ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>;
const B = ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>;

export const HELP_SECTIONS = [
  {
    id: 'start',                       // stable: this is also the deep-link target
    title: 'Getting started',
    summary: 'What this app is for',
    keywords: 'intro overview basics',
    // video: { src: './tour.mp4', poster: './tour.jpg', seconds: 47 },
    body: (
      <>
        <P>Say what the app is for before explaining any control.</P>
        <H>The loop</H>
        <UL>
          <li><B>Step one</B> — what the user does first, and why.</li>
          <li><B>Step two</B> — what it produces.</li>
        </UL>
      </>
    )
  },
  {
    id: 'faq',
    title: 'Common questions',
    summary: 'When something does not add up',
    keywords: 'problems troubleshooting help',
    body: (
      <>
        <H>Nothing appears after I run it</H>
        <P>Explain where to look, and what a slow case legitimately looks like.</P>
      </>
    )
  }
];
