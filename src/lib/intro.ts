/** Session flag: the logo intro plays once per browsing session. */
export const INTRO_STORAGE_KEY = "puro-intro-seen";

/** Total length of the intro, in seconds (keep in step with IntroCurtain). */
export const INTRO_DURATION = 2.1;

/**
 * Runs before the page paints (inline in <body>) and decides whether the intro
 * plays, so returning visitors never see a flash of the curtain.
 */
export const INTRO_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var seen=sessionStorage.getItem("${INTRO_STORAGE_KEY}");var calm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;d.dataset.intro=seen||calm?"skip":"play";}catch(e){}})();`;

/** Seconds to wait before hero animations start, so they follow the curtain. */
export function introDelay(): number {
  if (typeof document === "undefined") return 0;
  return document.documentElement.dataset.intro === "play" ? INTRO_DURATION - 0.35 : 0.1;
}
