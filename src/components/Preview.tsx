import { useEffect, useRef, useState } from "react";
import type { Game } from "../games/types";
import { numberOf } from "../util";
import Art from "./Art";

const W = 300;
const H = 220;

/** A small plate that trails the pointer over the index and shows the hovered game's drawing. */
export default function Preview({ game }: { game: Game | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Game | null>(game);
  useEffect(() => {
    if (game) setShown(game);
  }, [game]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const place = () => {
      const el = ref.current;
      if (!el) return;
      // ride in a lane between the titles and the meta columns (never over the hovered title),
      // following the pointer vertically and drifting only slightly sideways
      const lane = innerWidth * 0.53 - W / 2;
      const left = Math.min(innerWidth - W - 24, Math.max(24, lane + (x - innerWidth / 2) * 0.1));
      const top = Math.min(Math.max(16, y - H / 2), innerHeight - H - 16);
      el.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    };
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      place();
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`preview ${game ? "is-on" : ""}`} aria-hidden>
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
