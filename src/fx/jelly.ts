/**
 * The jelly engine: one rAF loop that drives every physical effect on the page.
 *
 *  [data-jelly]   spring squash/stretch + skew. Poked on hover (by pointer speed) and on press.
 *  [data-goo]     sprouts a gooey tendril that reaches for the cursor when it gets close.
 *
 * On mouse devices the native cursor is hidden and replaced by a jelly droplet with a little
 * trail: it stretches with speed, swells over clickable things (tinted to match them), squishes
 * and splashes on click, and turns into an upright bar over text fields.
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

  // the cursor (rendered by <GooCursor />)
  const gooFilter = document.getElementById("goo-filter");
  const gooGroup = document.getElementById("goo-group");
  const shine = document.getElementById("goo-shine");
  const lead = document.getElementById("goo-lead");
  const gloss = document.getElementById("goo-gloss");
  const bar = document.getElementById("goo-bar");
  const gooSvg = gooGroup?.closest("svg") ?? null;
  const neck = document.getElementById("goo-neck");
  const drops = [1, 2, 3, 4].map((i) => document.getElementById(`goo-drop-${i}`));
  const splashEls = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById(`goo-splash-${i}`));
  const trail = drops.map(() => ({ x: -999, y: -999 }));
  const splash = splashEls.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 }));
  const cur = { r: 7, tm: 0, vx: 0, vy: 0, lx: NaN, ly: NaN, press: { x: 0, v: 0 } as Spring };
  let aim: { kind: "none" | "ui" | "text"; el: Element | null } = { kind: "none", el: null };
  let neckEl: HTMLElement | null = null;
  const useCursor = fine && !!gooGroup && !!lead;
  if (useCursor) document.documentElement.classList.add("goo-cursor");

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
      cur.lx = cur.ly = NaN;
    }
    p.x = e.clientX;
    p.y = e.clientY;
    p.t = now;
    p.inside = true;
    moved = true;
  };
  const onOver = (e: PointerEvent) => {
    // what is the cursor over? (decides its size, colour and shape)
    const t = e.target instanceof Element ? e.target : null;
    const text = t?.closest('textarea, [contenteditable="true"], input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"])') ?? null;
    const ui = text ? null : t?.closest('a, button, label, summary, select, [role="button"], [data-jelly], [data-goo]') ?? null;
    const next = text ? { kind: "text" as const, el: text } : ui ? { kind: "ui" as const, el: ui } : { kind: "none" as const, el: null };
    if (gooSvg && next.el !== aim.el) {
      // tint to the deep shade of the jelly underneath so it stays visible on top of it
      const flavoured = next.el?.closest('[class*="hue-"]');
      if (next.kind === "ui" && flavoured) setVar(gooSvg, "--drop-now", getComputedStyle(next.el as Element).getPropertyValue("--jelly-deep").trim());
      else if (next.kind === "text" && flavoured) setVar(gooSvg, "--drop-now", "var(--ink)");
      else if (next.kind !== "none") setVar(gooSvg, "--drop-now", "var(--text)");
      else clearVar(gooSvg, "--drop-now");
    }
    aim = next;
    const el = t?.closest<HTMLElement>("[data-jelly]") ?? null;
    if (el && el !== hovered) {
      const speed = Math.hypot(p.vx, p.vy);
      poke(el, clamp(speed * 0.00006, 0.02, 0.07), clamp(p.vx * 0.003, -5, 5));
    }
    hovered = el;
  };
  const onDown = (e: PointerEvent) => {
    const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-jelly]") : null;
    if (el && !(el as HTMLButtonElement).disabled) poke(el, 0.11);
    if (useCursor && e.pointerType === "mouse") {
      // squish + a little splash of droplets
      cur.press.v += 0.3 * W;
      splash.forEach((d, i) => {
        const a = (i / splash.length) * Math.PI * 2 + Math.random() * 0.8;
        const sp = 150 + Math.random() * 130;
        d.x = e.clientX;
        d.y = e.clientY;
        d.vx = Math.cos(a) * sp;
        d.vy = Math.sin(a) * sp - 60;
        d.life = 1;
      });
      moved = true;
    }
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

    // the cursor: lead droplet on the pointer, a little trail, a tendril from nearby jellies, a splash
    if (gooRects && gooGroup && lead && useCursor) {
      let x0 = p.x - 30, y0 = p.y - 30, x1 = p.x + 30, y1 = p.y + 30;
      const grow = (x: number, y: number, r: number) => {
        x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r);
        x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r);
      };
      let settling = false;

      // stretch along the direction of travel
      const fvx = Number.isNaN(cur.lx) ? 0 : (p.x - cur.lx) / Math.max(dt, 0.001);
      const fvy = Number.isNaN(cur.ly) ? 0 : (p.y - cur.ly) / Math.max(dt, 0.001);
      cur.lx = p.x;
      cur.ly = p.y;
      cur.vx += (fvx - cur.vx) * 0.25;
      cur.vy += (fvy - cur.vy) * 0.25;
      const speed = Math.hypot(cur.vx, cur.vy);
      if (speed > 5) settling = true;

      // size for whatever is underneath; over text fields the droplet shrinks into a crisp text bar
      const tr = aim.kind === "ui" ? 10.5 : aim.kind === "text" ? 2.4 : 7;
      const ttm = aim.kind === "text" ? 1 : 0;
      cur.r += (tr - cur.r) * 0.25;
      cur.tm += (ttm - cur.tm) * 0.25;
      if (Math.abs(cur.r - tr) > 0.02 || Math.abs(cur.tm - ttm) > 0.01) settling = true;

      // press squish
      const ps = cur.press;
      ps.v += (-K * ps.x - C * ps.v) * dt;
      ps.x += ps.v * dt;
      if (Math.abs(ps.x) > 1e-3 || Math.abs(ps.v) > 1e-2) settling = true;

      const textish = cur.tm > 0.5;
      const st = textish ? 0 : Math.min(0.5, speed / 2400);
      const ang = ((Math.atan2(cur.vy, cur.vx) * 180) / Math.PI).toFixed(1);
      const shape =
        `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang}) scale(${(1 + st).toFixed(3)} ${(1 - st * 0.5).toFixed(3)}) rotate(${-ang}) ` +
        `scale(${(1 + ps.x).toFixed(3)} ${(1 - ps.x).toFixed(3)})`;
      setAttr(lead, "r", cur.r.toFixed(2));
      setAttr(lead, "transform", shape);
      grow(p.x, p.y, cur.r * 2.6);
      if (gloss) {
        setAttr(gloss, "transform", shape);
        setAttr(gloss, "cx", (-cur.r * 0.3).toFixed(2));
        setAttr(gloss, "cy", (-cur.r * 0.38).toFixed(2));
        setAttr(gloss, "rx", (cur.r * 0.32).toFixed(2));
        setAttr(gloss, "ry", (cur.r * 0.2).toFixed(2));
        setAttr(gloss, "opacity", textish ? "0" : "0.85");
      }
      if (bar) {
        const h = 22 * cur.tm;
        setAttr(bar, "transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(1 + ps.x * 0.5).toFixed(3)} 1)`);
        setAttr(bar, "y", (-h / 2).toFixed(2));
        setAttr(bar, "height", h.toFixed(2));
        setAttr(bar, "opacity", Math.min(1, cur.tm * 1.4).toFixed(2));
      }

      // trail
      let tx = p.x, ty = p.y;
      trail.forEach((t, i) => {
        const ease = 0.42 - i * 0.07;
        t.x += (tx - t.x) * ease;
        t.y += (ty - t.y) * ease;
        tx = t.x;
        ty = t.y;
        grow(t.x, t.y, 8);
        const el = drops[i];
        if (el) setAttr(el, "transform", `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`);
      });
      const tail = trail[trail.length - 1];
      if (Math.abs(tail.x - p.x) > 0.4 || Math.abs(tail.y - p.y) > 0.4) settling = true;

      // tendril: the nearest jelly reaches out for the cursor as it approaches (never drawn over it)
      let best = -1, bestD = 42;
      lists.goo.forEach((_, i) => {
        const r = gooRects[i];
        if (r.bottom < 0 || r.top > innerHeight) return;
        const d = edgeDist(r, p.x, p.y);
        if (d > 0.5 && d < bestD) { bestD = d; best = i; }
      });
      if (neck) {
        if (best >= 0 && p.inside) {
          const r = gooRects[best];
          const ex = clamp(p.x, r.left, r.right), ey = clamp(p.y, r.top, r.bottom);
          const nx = (p.x - ex) / bestD, ny = (p.y - ey) / bestD;
          const t = 1 - bestD / 42;
          const reach = bestD * (0.25 + 0.62 * t);
          // starts exactly at the edge and only grows outward
          const cx = ex + (nx * reach) / 2, cy = ey + (ny * reach) / 2;
          setAttr(neck, "transform", `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${((Math.atan2(ny, nx) * 180) / Math.PI).toFixed(1)})`);
          setAttr(neck, "rx", (reach / 2 + 2).toFixed(1));
          setAttr(neck, "ry", (2 + 4.5 * t * t).toFixed(1));
          const el = lists.goo[best];
          if (el !== neckEl) {
            neckEl = el;
            setAttr(neck, "style", `fill:${getComputedStyle(el).getPropertyValue("--jelly").trim() || "var(--drop)"}`);
          }
          grow(cx, cy, reach);
        } else {
          setAttr(neck, "rx", "0");
          setAttr(neck, "ry", "0");
        }
      }

      // splash
      splash.forEach((d, i) => {
        const el = splashEls[i];
        if (!el) return;
        if (d.life > 0) {
          d.life = Math.max(0, d.life - dt / 0.5);
          d.vy += 700 * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          grow(d.x, d.y, 6);
          settling = true;
        }
        setAttr(el, "r", d.life > 0 ? (2 + 3 * Math.sqrt(d.life)).toFixed(2) : "0");
        setAttr(el, "transform", `translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`);
      });

      const hidden = !p.inside;
      if (gooGroup.classList.contains("is-hidden") !== hidden) {
        gooGroup.classList.toggle("is-hidden", hidden);
        shine?.classList.toggle("is-hidden", hidden);
      }
      // keep the blur limited to the area around the cursor
      if (gooFilter) {
        const pad = 16;
        setAttr(gooFilter, "x", (x0 - pad).toFixed(0));
        setAttr(gooFilter, "y", (y0 - pad).toFixed(0));
        setAttr(gooFilter, "width", (x1 - x0 + pad * 2).toFixed(0));
        setAttr(gooFilter, "height", (y1 - y0 + pad * 2).toFixed(0));
      }
      if (settling) busyUntil = Math.max(busyUntil, now + 60);
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
