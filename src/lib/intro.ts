/**
 * The homepage opening plays on every visit to the homepage, except for
 * visitors who ask their system for reduced motion. It is always skippable.
 */
export function introShouldPlay(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
