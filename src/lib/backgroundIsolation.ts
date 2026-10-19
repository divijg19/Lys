/**
 * Background isolation for portalled overlays.
 *
 * Both the expertise dialog and the mobile menu render into a portal on `document.body` and need the
 * rest of the page taken out of reach while they are open: keyboard focus, pointer events and
 * assistive-tech traversal all have to stop at the overlay.
 *
 * This used to be copy-pasted in both components, each with its own `@ts-expect-error` for `inert`.
 * The duplication was not just untidy -- it was a drift surface. The two copies were the last
 * remaining instances of a pattern that had already caused several bugs in this codebase when one
 * copy of duplicated logic was updated and its sibling was not.
 *
 * Returns a restore function, or `null` when the overlay is not a direct child of `document.body`.
 * Callers that render inline rather than portalled must not isolate: the "siblings" would then
 * include the overlay's own ancestors, and making them inert would hide the page the overlay lives
 * in. Every caller already guards on this, so the check lives here rather than at each call site.
 */
export function isolateBackground(overlay: HTMLElement): (() => void) | null {
  if (overlay.parentElement !== document.body) return null;

  const siblings = Array.from(document.body.children).filter((el) => el !== overlay);

  siblings.forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    // `inert` is not yet in TypeScript's DOM lib. It is a no-op on browsers that predate it, and
    // both consumers also manage focus themselves, so the attribute alone is not load-bearing --
    // `aria-hidden` plus programmatic focus management are the primary mechanism.
    // @ts-expect-error inert is missing from the DOM lib
    el.inert = true;
  });

  return () => {
    siblings.forEach((el) => {
      el.removeAttribute("aria-hidden");
      // @ts-expect-error inert is missing from the DOM lib
      el.inert = false;
    });
  };
}
