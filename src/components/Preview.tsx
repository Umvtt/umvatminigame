import { useEffect, useRef, useState } from "react";
import type { Game } from "../games/types";
import { numberOf } from "../util";
import Art from "./Art";

export type Hovered = { game: Game; row: HTMLElement } | null;

const MAX_W = 300;
const MIN_W = 190;
const RATIO = 0.73; // height / width
const GAP = 28; // breathing room either side

/**
 * A small plate showing the hovered game's drawing. It sits in the empty space of the hovered
 * row, between the description and the category label, so it never covers either; it glides
 * from row to row and hides when the row has no room for it.
 */
export default function Preview({ hovered }: { hovered: Hovered }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Game | null>(hovered?.game ?? null);
  const [fits, setFits] = useState(false);
  const target = useRef<Hovered>(hovered);
  target.current = hovered;

  useEffect(() => {
    if (hovered) setShown(hovered.game);
  }, [hovered]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const box = { x: 0, y: 0, w: MAX_W, ready: false };
    let pointerY = 0;
    let raf = 0;

    /** Where the plate should be for the current row, or null if the row has no room. */
    const slot = () => {
      const row = target.current?.row;
      if (!row) return null;
      const text = row.querySelectorAll<HTMLElement>(".row-title, .row-desc");
      const tag = row.querySelector<HTMLElement>(".row-tag");
      const r = row.getBoundingClientRect();
      if (!tag || !text.length) return null;
      const textRight = Math.max(...[...text].map((t) => t.getBoundingClientRect().right));
      const tagLeft = tag.getBoundingClientRect().left;
      const room = tagLeft - textRight - GAP * 2;
      if (room < MIN_W) return null;
      const w = Math.min(MAX_W, room);
      const h = w * RATIO;
      const cy = r.top + r.height / 2;
      // a gentle lean toward the pointer, but always inside the gap
      const lean = Math.max(-1, Math.min(1, (pointerY - cy) / r.height)) * 8;
      return { x: textRight + GAP + (room - w) / 2, y: cy - h / 2 + lean, w };
    };

    const tick = () => {
      raf = 0;
      const s = slot();
      setFits(Boolean(s));
      if (s) {
        if (!box.ready) Object.assign(box, s, { ready: true }); // first appearance: start in place
        box.x += (s.x - box.x) * 0.18;
        box.y += (s.y - box.y) * 0.18;
        box.w += (s.w - box.w) * 0.18;
        const el = ref.current;
        if (el) {
          el.style.transform = `translate3d(${box.x.toFixed(1)}px, ${box.y.toFixed(1)}px, 0)`;
          el.style.width = `${box.w.toFixed(1)}px`;
          el.style.height = `${(box.w * RATIO).toFixed(1)}px`;
        }
        const moving = Math.abs(s.x - box.x) + Math.abs(s.y - box.y) + Math.abs(s.w - box.w) > 0.3;
        if (moving) raf = requestAnimationFrame(tick);
      } else {
        box.ready = false;
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => { pointerY = e.clientY; kick(); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  // re-measure whenever the hovered row changes
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [hovered]);

  return (
    <div ref={ref} className={`preview ${hovered && fits ? "is-on" : ""}`} aria-hidden>
      {shown && (
        <div className="preview-inner" key={shown.slug}>
          <div className="preview-art"><Art name={shown.art} /></div>
          <div className="preview-cap mono">
            <span>Fig. {numberOf(shown)}</span>
            <span>{shown.component ? "Available" : "In development"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
