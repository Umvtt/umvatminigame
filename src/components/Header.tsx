import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { SITE } from "../site";

/** One-eyed jelly mascot. The pupil follows the cursor and it blinks. */
export function Logo() {
  const svg = useRef<SVGSVGElement>(null);
  const pupil = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const box = svg.current?.getBoundingClientRect();
      if (!box || !pupil.current) return;
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(d / 60, 1) * 4.5;
      pupil.current.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <svg ref={svg} viewBox="0 0 66 66" width="42" height="42" aria-hidden className="mascot">
      <path d="M36 11 C49 9 61 19 61 34 C61 49 51 61 36 61 C21 61 11 50 11 36 C11 22 23 12 36 11 Z" fill="#14110f" stroke="#14110f" strokeWidth="4" strokeLinejoin="round" />
      <path className="jelly" d="M33 8 C46 6 58 16 58 31 C58 46 48 58 33 58 C18 58 8 47 8 33 C8 19 20 9 33 8 Z" fill="#ff5a36" stroke="#14110f" strokeWidth="4" strokeLinejoin="round" />
      <g className="eye">
        <circle cx="33" cy="29" r="12" fill="#fffaf0" stroke="#14110f" strokeWidth="3.5" />
        <circle ref={pupil} className="pupil" cx="33" cy="29" r="5" fill="#14110f" />
      </g>
      <path className="mouth" d="M24 47 Q33 53 42 47" fill="none" stroke="#14110f" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="header">
      <div className="wrap">
        <Link to="/" className="logo">
          <Logo />
          <span>{SITE.name}</span>
        </Link>
        <span className="count">({String(games.length).padStart(2, "0")} games)</span>
      </div>
    </header>
  );
}
