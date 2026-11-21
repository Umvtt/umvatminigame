/**
 * The jelly engine: one rAF loop that drives every physical effect on the page.
 *
 *  [data-jelly]   spring squash/stretch + skew. Poked on hover (by pointer speed) and on press.
 *  [data-goo]     the cursor droplet melts into it (liquid bridge) when close.
 *  [data-shy]     leans away from the pointer, then peeks back if you wait.
 *  [data-eyes]    pupils look at the pointer (or away, inside a shy element that isn't peeking).
 *  [data-inflate] variable font weight swells as the pointer gets near.
 *
 * Everything is written as CSS custom properties, so styling stays in styles.css.
 */

type Spring = { x: number; v: number };
type Jelly = { s: Spring; k: Spring };

const K = 260; // stiffness
const C = 9; // damping
const W = Math.sqrt(K); // natural frequency: turns a target peak into an impulse

const jellies = new Map<HTMLElement, Jelly>();
const shyState = new WeakMap<HTMLElement, { x: number; y: number; since: number }>();
const inflateState = new WeakMap<HTMLElement, number>();

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // goo cursor parts (rendered by <GooCursor />)
  const gooGroup = document.getElementById("goo-group");
  const drops = [0, 1, 2, 3, 4].map((i) => document.getElementById(`goo-drop-${i}`));
  const magnet = document.getElementById("goo-magnet");
  const trail = drops.map(() => ({ x: -999, y: -999 }));
  let magnetEl: HTMLElement | null = null;

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
    if (e.pointerType !== "mouse") { p.x = e.clientX; p.y = e.clientY; }
  };
  const onLeave = () => { p.inside = false; };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;

    // springs
    for (const [el, j] of jellies) {
      for (const s of [j.s, j.k]) {
        s.v += (-K * s.x - C * s.v) * dt;
        s.x += s.v * dt;
      }
      const rest = Math.abs(j.s.x) < 1e-4 && Math.abs(j.s.v) < 1e-3 && Math.abs(j.k.x) < 1e-3 && Math.abs(j.k.v) < 1e-2;
      if (rest || !el.isConnected) {
        el.style.removeProperty("--js");
        el.style.removeProperty("--jk");
        jellies.delete(el);
      } else {
        el.style.setProperty("--js", j.s.x.toFixed(4));
        el.style.setProperty("--jk", `${j.k.x.toFixed(3)}deg`);
      }
    }

    // shy elements lean away, then peek back after a while
    for (const el of document.querySelectorAll<HTMLElement>("[data-shy]")) {
      const st = shyState.get(el) ?? { x: 0, y: 0, since: 0 };
      const r = el.getBoundingClientRect();
      const home = new DOMRect(r.left - st.x, r.top - st.y, r.width, r.height);
      const edge = edgeDist(home, p.x, p.y);
      const R = 150;
      let tx = 0, ty = 0;
      if (fine && p.inside && edge < R) {
        if (!st.since) st.since = now;
        const dx = home.left + home.width / 2 - p.x;
        const dy = home.top + home.height / 2 - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const peek = now - st.since > 1400;
        const push = (1 - edge / R) * (peek ? 8 : 26);
        tx = (dx / d) * push;
        ty = (dy / d) * push * 0.6;
        el.classList.toggle("is-peeking", peek);
        el.classList.add("is-shy");
      } else {
        st.since = 0;
        el.classList.remove("is-peeking", "is-shy");
      }
      st.x += (tx - st.x) * 0.12;
      st.y += (ty - st.y) * 0.12;
      shyState.set(el, st);
      el.style.setProperty("--shx", `${st.x.toFixed(2)}px`);
      el.style.setProperty("--shy", `${st.y.toFixed(2)}px`);
      el.style.setProperty("--shr", `${(st.x * 0.35).toFixed(2)}deg`);
    }

    // eyes follow the pointer
    for (const el of document.querySelectorAll<HTMLElement>("[data-eyes]")) {
      const r = el.getBoundingClientRect();
      const dx = p.x - (r.left + r.width / 2);
      const dy = p.y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const m = p.inside || !fine ? Math.min(1, d / 160) : 0;
      const shy = el.closest<HTMLElement>("[data-shy]");
      const away = shy?.classList.contains("is-shy") && !shy.classList.contains("is-peeking") ? -1 : 1;
      el.style.setProperty("--lx", ((dx / d) * m * away).toFixed(3));
      el.style.setProperty("--ly", ((dy / d) * m * away).toFixed(3));
    }

    // letters puff up near the pointer
    if (fine) {
      for (const el of document.querySelectorAll<HTMLElement>("[data-inflate]")) {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(p.x - (r.left + r.width / 2), p.y - (r.top + r.height / 2));
        const target = p.inside ? Math.max(0, 1 - d / 240) : 0;
        const cur = inflateState.get(el) ?? 0;
        const next = cur + (target - cur) * 0.14;
        if (Math.abs(next - cur) > 0.0005 || !inflateState.has(el)) el.style.setProperty("--inf", next.toFixed(3));
        inflateState.set(el, next);
      }
    }

    // goo cursor: a droplet with a trail that bridges into nearby [data-goo] elements
    if (gooGroup && fine) {
      let tx = p.x, ty = p.y;
      trail.forEach((t, i) => {
        const ease = i === 0 ? 0.6 : 0.34 - i * 0.04;
        t.x += (tx - t.x) * ease;
        t.y += (ty - t.y) * ease;
        tx = t.x;
        ty = t.y;
        drops[i]?.setAttribute("transform", `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`);
      });
      gooGroup.classList.toggle("is-hidden", !p.inside);

      let best: HTMLElement | null = null;
      let bestD = 70;
      for (const el of document.querySelectorAll<HTMLElement>("[data-goo]")) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const d = edgeDist(r, p.x, p.y);
        if (d < bestD) { bestD = d; best = el; }
      }
      if (best !== magnetEl) {
        magnetEl = best;
        const color = best ? getComputedStyle(best).getPropertyValue("--jelly").trim() : "";
        if (color) gooGroup.style.setProperty("--drop-now", color);
        else gooGroup.style.removeProperty("--drop-now");
      }
      if (magnet) {
        if (best) {
          const r = best.getBoundingClientRect();
          const inset = Math.min(5, r.height / 6);
          magnet.setAttribute("x", `${r.left + inset}`);
          magnet.setAttribute("y", `${r.top + inset}`);
          magnet.setAttribute("width", `${Math.max(0, r.width - inset * 2)}`);
          magnet.setAttribute("height", `${Math.max(0, r.height - inset * 2)}`);
          magnet.setAttribute("rx", `${Math.min(26, r.height / 3)}`);
        } else {
          magnet.setAttribute("width", "0");
          magnet.setAttribute("height", "0");
        }
      }
    }
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerover", onOver);
    window.removeEventListener("pointerdown", onDown);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}
