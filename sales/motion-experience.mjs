/** W1 Capital: progressive motion; the static site is fully usable without this file/CDN. */
const MOTION_CDN = "https://cdn.jsdelivr.net/npm/motion@14.10.0/+esm";

export function shouldEnableMotion(win) {
  return !win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    && !win?.navigator?.connection?.saveData;
}

export async function startMotionExperience({
  win = globalThis.window,
  doc = globalThis.document,
  load = () => import(MOTION_CDN)
} = {}) {
  if (!win || !doc || !shouldEnableMotion(win)) return false;
  let motion;
  try { motion = await load(); } catch { return false; }
  const {animate, stagger, inView, scroll} = motion || {};
  if (![animate, stagger, inView, scroll].every(fn => typeof fn === "function")) return false;

  try {
    // Intro: no permanent hidden state or delayed critical text rendering.
    const hero = Array.from(doc.querySelectorAll("[data-motion-hero]"));
    if (hero.length) {
      animate(hero, {opacity: [0.82, 1], y: [16, 0]}, {
        duration: 0.8, delay: stagger(0.085), ease: [0.22, 1, 0.36, 1]
      });
    }
    // Thin progress rail, purely decorative, never part of accessibility tree.
    const progress = doc.querySelector("[data-motion-progress]");
    if (progress) scroll(animate(progress, {scaleX: [0, 1]}, {ease: "linear"}));

    // A gentle reveal only when scrolling is observed; links remain interactive.
    if ("IntersectionObserver" in win) {
      for (const card of doc.querySelectorAll("[data-motion-reveal]")) {
        inView(card, (element) => {
          animate(element, {opacity: [0.83, 1], y: [12, 0]}, {
            duration: 0.65, ease: [0.22, 1, 0.36, 1]
          });
        }, {margin: "0px 0px -7% 0px"});
      }
    }
    return true;
  } catch {
    // Motion is optional: navigation, forms and content are independent of it.
    return false;
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  void startMotionExperience();
}
