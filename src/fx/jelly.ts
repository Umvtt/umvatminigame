/**
 * The jelly engine: one rAF loop that drives every physical effect on the page.
 *
 *  [data-jelly]   spring squash/stretch + skew. Poked on hover (by pointer speed) and on press.
 *  [data-goo]     the cursor droplet melts into it (liquid bridge) when close.
 *  [data-shy]     leans away from the pointer, then peeks back if you wait.
 *  [data-eyes]    its [data-pupil] children look at the pointer (or away, inside a shy element).
 *  [data-inflate] variable font weight swells as the pointer gets near.
 *
 * Performance rules (this runs every frame):
 *  - each frame reads all geometry first, then writes; never a read after a write (no layout thrash)
 *  - a value is only written when it changed, and pointer-driven work is skipped while idle
 *  - the custom properties written here are registered as non-inherited (see styles.css),
 *    so changing one restyles only that element, not its whole subtree
 *  - element lists are cached and refreshed only when the DOM changes
 */

type Spring = { x: number; v: number };
type Jelly = { s: Spring; k: Spring };

const K = 260; // stiffness
const C = 9; // damping
const W = Math.sqrt(K); // natural frequency: turns a target peak into an impulse

const jellies = new Map<HTMLElement, Jelly>();
const shyState = new WeakMap<Element, { x: number; y: number; since: number }>();
const inflateState = new WeakMap<Element, number>();
const written = new WeakMap<Element, Map<string, string>>();

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function cacheOf(el: Element) {
  let m = written.get(el);
  if (!m) written.set(el, (m = new Map()));
  return m;
}
/** Set a custom property only if it actually changed. */
function setVar(el: HTMLElement | SVGElement, name: string, value: string) {
  const m = cacheOf(el);
  if (m.get(name) === value) return;
  m.set(name, value);
  el.style.setProperty(name, value);
}
function clearVar(el: HTMLElement | SVGElement, name: string) {
  const m = written.get(el);
  if (!m?.has(name)) return;
  m.delete(name);
  el.style.removeProperty(name);
}
function setAttr(el: Element, name: string, value: string) {
  const m = cacheOf(el);
  const key = `@${name}`;
  if (m.get(key) === value) return;
  m.set(key, value);
  el.setAttribute(name, value);
}

/** Wobble an element. `squash` > 0 = wider & shorter at the peak; `skew` in degrees. */
export function poke(el: HTMLElement | null, squash = 0.08, skew = 0) {
  if (!el || reducedMotion()) return;
  let j = jellies.get(el);
  if (!j) {
    j = { s: { x: 0, v: 0 }, k: { x: 0, v: 0 } };
    jellies.set(el, j);
  }
  j.s.v += squash * W;
  j.k.v += skew * W;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Distance from a point to a rect's edge (0 when inside). */
const edgeDist = (r: DOMRect, x: number, y: number) =>
  Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));

export function installJelly() {
  if (reducedMotion()) return () => {};
  const fine = window.matchMedia("(pointer: fine)").matches;
  const p = { x: -999, y: -999, vx: 0, vy: 0, t: performance.now(), inside: false };
  let hovered: HTMLElement | null = null;
  let raf = 0;
  let last = performance.now();
  let moved = true; // pointer moved / page scrolled since the last frame
  let busyUntil = 0; // keep updating for a moment after the last movement so everything settles

  // goo cursor parts (rendered by <GooCursor />)
  const gooFilter = document.getElementById("goo-filter");
  const gooGroup = document.getElementById("goo-group");
  const drops = [0, 1, 2, 3, 4].map((i) => document.getElementById(`goo-drop-${i}`));
  const magnet = document.getElementById("goo-magnet");
  const trail = drops.map(() => ({ x: -999, y: -999 }));
  let magnetEl: HTMLElement | null = null;

  // cached element lists, refreshed when the DOM changes
  let lists = { shy: [] as HTMLElement[], eyes: [] as HTMLElement[], inflate: [] as HTMLElement[], goo: [] as HTMLElement[] };
  const pupils = new WeakMap<Element, HTMLElement[]>();
  let listsDirty = true;
  const refreshLists = () => {
    const q = (s: string) => [...document.querySelectorAll<HTMLElement>(s)];
    lists = { shy: q("[data-shy]"), eyes: q("[data-eyes]"), inflate: q("[data-inflate]"), goo: q("[data-goo]") };
    for (const e of lists.eyes) pupils.set(e, [...e.querySelectorAll<HTMLElement>("[data-pupil]")]);
    listsDirty = false;
  };
  const mo = new MutationObserver(() => {
    listsDirty = true;
    moved = true;
  });
  mo.observe(document.body, { childList: true, subtree: true });

  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(1, now - p.t) / 1000;
    if (p.inside) {
      p.vx = p.vx * 0.6 + ((e.clientX - p.x) / dt) * 0.4;
      p.vy = p.vy * 0.6 + ((e.clientY - p.y) / dt) * 0.4;
    } else {
      p.vx = p.vy = 0;
      for (const t of trail) { t.x = e.clientX; t.y = e.clientY; }
    }
    p.x = e.clientX;
    p.y = e.clientY;
    p.t = now;
    p.inside = true;
    moved = true;
  };
  const onOver = (e: PointerEvent) => {
    const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-jelly]") : null;
    if (el && el !== hovered) {
      const speed = Math.hypot(p.vx, p.vy);
      poke(el, clamp(speed * 0.00006, 0.02, 0.07), clamp(p.vx * 0.003, -5, 5));
    }
    hovered = el;
  };
  const onDown = (e: PointerEvent) => {
    const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-jelly]") : null;
    if (el && !(el as HTMLButtonElement).disabled) poke(el, 0.11);
    if (e.pointerType !== "mouse") {
      p.x = e.clientX;
      p.y = e.clientY;
      moved = true;
    }
  };
  const onLeave = () => { p.inside = false; moved = true; };
  const onScroll = () => { moved = true; };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    if (listsDirty) refreshLists();
    if (moved) busyUntil = now + 1800;
    moved = false;
    const busy = now < busyUntil;

    // ---------- READ: all geometry first (layout is clean at the start of a frame) ----------
    const shyRects = busy ? lists.shy.map((el) => el.getBoundingClientRect()) : null;
    const eyeRects = busy ? lists.eyes.map((el) => el.getBoundingClientRect()) : null;
    const infRects = busy && fine ? lists.inflate.map((el) => el.getBoundingClientRect()) : null;
    const gooRects = busy && fine && gooGroup ? lists.goo.map((el) => el.getBoundingClientRect()) : null;

    // ---------- WRITE ----------
    for (const [el, j] of jellies) {
      for (const s of [j.s, j.k]) {
        s.v += (-K * s.x - C * s.v) * dt;
        s.x += s.v * dt;
      }
      const rest = Math.abs(j.s.x) < 1e-4 && Math.abs(j.s.v) < 1e-3 && Math.abs(j.k.x) < 1e-3 && Math.abs(j.k.v) < 1e-2;
      if (rest || !el.isConnected) {
        clearVar(el, "--js");
        clearVar(el, "--jk");
        jellies.delete(el);
      } else {
        setVar(el, "--js", j.s.x.toFixed(4));
        setVar(el, "--jk", `${j.k.x.toFixed(2)}deg`);
      }
    }

    // shy elements lean away, then peek back after a while
    if (shyRects) {
      lists.shy.forEach((el, i) => {
        const st = shyState.get(el) ?? { x: 0, y: 0, since: 0 };
        const r = shyRects[i];
        const home = new DOMRect(r.left - st.x, r.top - st.y, r.width, r.height);
        const edge = edgeDist(home, p.x, p.y);
        const R = 150;
        let tx = 0, ty = 0;
        let shy = false, peek = false;
        if (fine && p.inside && edge < R) {
          if (!st.since) st.since = now;
          const dx = home.left + home.width / 2 - p.x;
          const dy = home.top + home.height / 2 - p.y;
          const d = Math.hypot(dx, dy) || 1;
          shy = true;
          peek = now - st.since > 1400;
          const push = (1 - edge / R) * (peek ? 8 : 26);
          tx = (dx / d) * push;
          ty = (dy / d) * push * 0.6;
          busyUntil = Math.max(busyUntil, now + 300); // stay awake to catch the peek moment
        } else {
          st.since = 0;
        }
        if (el.classList.contains("is-shy") !== shy) el.classList.toggle("is-shy", shy);
        if (el.classList.contains("is-peeking") !== peek) el.classList.toggle("is-peeking", peek);
        st.x += (tx - st.x) * 0.12;
        st.y += (ty - st.y) * 0.12;
        shyState.set(el, st);
        setVar(el, "--shx", `${st.x.toFixed(1)}px`);
        setVar(el, "--shy", `${st.y.toFixed(1)}px`);
        setVar(el, "--shr", `${(st.x * 0.35).toFixed(1)}deg`);
      });
    }

    // eyes follow the pointer
    if (eyeRects) {
      lists.eyes.forEach((el, i) => {
        const r = eyeRects[i];
        const dx = p.x - (r.left + r.width / 2);
        const dy = p.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const m = p.inside || !fine ? Math.min(1, d / 160) : 0;
        const shy = el.closest("[data-shy]");
        const away = shy?.classList.contains("is-shy") && !shy.classList.contains("is-peeking") ? -1 : 1;
        const lx = ((dx / d) * m * away).toFixed(2);
        const ly = ((dy / d) * m * away).toFixed(2);
        for (const pu of pupils.get(el) ?? []) {
          setVar(pu, "--lx", lx);
          setVar(pu, "--ly", ly);
        }
      });
    }

    // letters puff up near the pointer (quantised: each weight change costs a text layout)
    if (infRects) {
      lists.inflate.forEach((el, i) => {
        const r = infRects[i];
        const d = Math.hypot(p.x - (r.left + r.width / 2), p.y - (r.top + r.height / 2));
        const target = p.inside ? Math.max(0, 1 - d / 240) : 0;
        const cur = inflateState.get(el) ?? 0;
        const next = cur + (target - cur) * 0.14;
        inflateState.set(el, next);
        setVar(el, "--inf", (Math.round(next * 40) / 40).toFixed(3));
      });
    }

    // goo cursor: a droplet with a trail that bridges into nearby [data-goo] elements
    if (gooRects && gooGroup) {
      let tx = p.x, ty = p.y;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      trail.forEach((t, i) => {
        const ease = i === 0 ? 0.6 : 0.34 - i * 0.04;
        t.x += (tx - t.x) * ease;
        t.y += (ty - t.y) * ease;
        tx = t.x;
        ty = t.y;
        x0 = Math.min(x0, t.x); x1 = Math.max(x1, t.x);
        y0 = Math.min(y0, t.y); y1 = Math.max(y1, t.y);
        const el = drops[i];
        if (el) setAttr(el, "transform", `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`);
      });
      if (gooGroup.classList.contains("is-hidden") === p.inside) gooGroup.classList.toggle("is-hidden", !p.inside);

      let best: HTMLElement | null = null;
      let bestR: DOMRect | null = null;
      let bestD = 70;
      lists.goo.forEach((el, i) => {
        const r = gooRects[i];
        if (r.bottom < 0 || r.top > innerHeight) return;
        const d = edgeDist(r, p.x, p.y);
        if (d < bestD) { bestD = d; best = el; bestR = r; }
      });
      if (best !== magnetEl) {
        magnetEl = best;
        const color = best ? getComputedStyle(best).getPropertyValue("--jelly").trim() : "";
        if (color) setVar(gooGroup, "--drop-now", color);
        else clearVar(gooGroup, "--drop-now");
      }
      if (magnet) {
        const r = bestR as DOMRect | null;
        if (r) {
          const inset = Math.min(5, r.height / 6);
          const x = r.left + inset, y = r.top + inset;
          const w = Math.max(0, r.width - inset * 2), h = Math.max(0, r.height - inset * 2);
          setAttr(magnet, "x", x.toFixed(0));
          setAttr(magnet, "y", y.toFixed(0));
          setAttr(magnet, "width", w.toFixed(0));
          setAttr(magnet, "height", h.toFixed(0));
          setAttr(magnet, "rx", Math.min(26, r.height / 3).toFixed(0));
          // only the part of the shape near the droplet can visibly merge with it
          const nx0 = Math.max(x, p.x - 90), nx1 = Math.min(x + w, p.x + 90);
          const ny0 = Math.max(y, p.y - 90), ny1 = Math.min(y + h, p.y + 90);
          if (nx0 < nx1 && ny0 < ny1) {
            x0 = Math.min(x0, nx0); x1 = Math.max(x1, nx1);
            y0 = Math.min(y0, ny0); y1 = Math.max(y1, ny1);
          }
        } else {
          setAttr(magnet, "width", "0");
          setAttr(magnet, "height", "0");
        }
      }
      // keep the expensive blur limited to the area around the droplet
      if (gooFilter) {
        const pad = 40;
        setAttr(gooFilter, "x", (x0 - pad).toFixed(0));
        setAttr(gooFilter, "y", (y0 - pad).toFixed(0));
        setAttr(gooFilter, "width", (x1 - x0 + pad * 2).toFixed(0));
        setAttr(gooFilter, "height", (y1 - y0 + pad * 2).toFixed(0));
      }
      // keep going until the trail has caught up with the pointer
      const tail = trail[trail.length - 1];
      if (Math.abs(tail.x - p.x) > 0.5 || Math.abs(tail.y - p.y) > 0.5) busyUntil = Math.max(busyUntil, now + 50);
    }
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    mo.disconnect();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerover", onOver);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}
