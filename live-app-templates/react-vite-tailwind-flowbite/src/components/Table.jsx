/**
 * Table primitives that forward every prop they are given.
 *
 * A wrapper that renders `<td className={…}>{children}</td>` and nothing else looks
 * complete and silently drops `colSpan`, `rowSpan`, `scope`, `headers`, `id`, and every
 * aria-* and data-* attribute. That is how an empty-state row ends up occupying one
 * column instead of spanning the table: it renders, it looks nearly right, and no gate
 * has anything to complain about.
 *
 * Every primitive below spreads `...rest` onto its element, so anything valid on the
 * underlying tag works. Use them rather than hand-rolling `<td>` wrappers.
 *
 * Colour comes from the `--pt-*` variables in index.css, never from palette
 * utilities and never with a `dark:` variant — so these work unchanged under both
 * colour strategies in AGENTS.md §4. An @theme inline project repoints the six
 * variables once; it does not override these components at every call site, and it
 * cannot lose the silent alphabetical race between `bg-card` and `bg-white`.
 */

const join = (...parts) => parts.filter(Boolean).join(' ');

export function Table({ className, ...rest }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={join('w-full text-left text-sm text-[var(--pt-on-surface)]', className)}
        {...rest}
      />
    </div>
  );
}

export function THead({ className, ...rest }) {
  return (
    <thead
      className={join(
        'text-xs uppercase tracking-wide text-[var(--pt-muted)]',
        'border-b border-[var(--pt-hairline)]',
        className
      )}
      {...rest}
    />
  );
}

export function TBody({ className, ...rest }) {
  return <tbody className={join('divide-y divide-[var(--pt-hairline)]', className)} {...rest} />;
}

export function Tr({ className, ...rest }) {
  return <tr className={join('hover:bg-[var(--pt-hover)]', className)} {...rest} />;
}

/** A header cell. `scope` defaults to `col`, which is what a screen reader needs. */
export function Th({ className, scope = 'col', ...rest }) {
  return <th scope={scope} className={join('px-4 py-3 font-medium', className)} {...rest} />;
}

export function Td({ className, ...rest }) {
  return <td className={join('px-4 py-3 align-middle', className)} {...rest} />;
}
