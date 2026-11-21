/** Shared motion helpers + global pointer effects (tilt, spotlight, magnetic, ripple). */

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Installs delegated, rAF-throttled pointer effects once for the whole app:
 *  - --px/--py on <html> (pointer position, used by the background spotlight + parallax)
 *  - [data-tilt]     : 3D tilt + --mx/--my spotlight position
 *  - [data-magnetic] : element leans toward the pointer
 *  - [data-ripple]   : ink ripple on press
 */
export function installMotion() {
  const root = document.documentElement;
  let raf = 0;
  let last: PointerEvent | null = null;
  let tilted: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;

  const resetTilt = (el: HTMLElement) => {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
    el.classList.remove("is-tilting");
  };
  const resetMagnet = (el: HTMLElement) => {
    el.style.removeProperty("--tx");
    el.style.removeProperty("--ty");
  };

  const flush = () => {
    raf = 0;
    const e = last;
    if (!e) return;
    root.style.setProperty("--px", `${e.clientX}px`);
    root.style.setProperty("--py", `${e.clientY}px`);
    if (reducedMotion() || e.pointerType !== "mouse") return;

    const target = e.target instanceof Element ? e.target : null;
    const t = target?.closest<HTMLElement>("[data-tilt]") ?? null;
    if (tilted && tilted !== t) resetTilt(tilted);
    tilted = t;
    if (t) {
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      t.style.setProperty("--mx", `${x * 100}%`);
      t.style.setProperty("--my", `${y * 100}%`);
      t.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
      t.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
      t.classList.add("is-tilting");
    }

    const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
    if (magnet && magnet !== m) resetMagnet(magnet);
    magnet = m;
    if (m) {
      const r = m.getBoundingClientRect();
      m.style.setProperty("--tx", `${(e.clientX - (r.left + r.width / 2)) * 0.25}px`);
      m.style.setProperty("--ty", `${(e.clientY - (r.top + r.height / 2)) * 0.3}px`);
    }
  };

  const onMove = (e: PointerEvent) => {
    last = e;
    if (!raf) raf = requestAnimationFrame(flush);
  };
  const onLeave = () => {
    if (tilted) resetTilt(tilted);
    if (magnet) resetMagnet(magnet);
    tilted = magnet = null;
  };
  const onDown = (e: PointerEvent) => {
    if (reducedMotion()) return;
    const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-ripple]") : null;
    if (!el || (el as HTMLButtonElement).disabled) return;
    const r = el.getBoundingClientRect();
    const size = Math.hypot(r.width, r.height) * 2;
    const ink = document.createElement("span");
    ink.className = "ripple";
    ink.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.appendChild(ink);
    ink.addEventListener("animationend", () => ink.remove(), { once: true });
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  root.addEventListener("pointerleave", onLeave);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    root.removeEventListener("pointerleave", onLeave);
  };
}
