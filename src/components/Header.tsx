import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { SITE } from "../site";

/** Hex nut + crosshair mark. Slowly turns, spins up on hover. */
export function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="mark">
      <g className="nut">
        <polygon points="58,32 45,54.5 19,54.5 6,32 19,9.5 45,9.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M32 16v8M32 40v8M16 32h8M40 32h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="32" cy="32" r="4.5" fill="var(--yellow)" />
    </svg>
  );
}

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <>{t.toLocaleTimeString("en-GB")}</>;
}

/** Header styled as a drawing title block. */
export default function Header() {
  const open = games.filter((g) => g.component).length;
  return (
    <header className="tb">
      <div className="tb-inner">
        <Link to="/" className="tb-cell tb-brand">
          <Logo />
          <span>{SITE.name}</span>
        </Link>
        <div className="tb-cell tb-hide"><small>SCALE</small>1:1</div>
        <div className="tb-cell tb-hide"><small>DRAWINGS</small>{String(games.length).padStart(2, "0")}</div>
        <div className="tb-cell"><small>APPROVED</small>{String(open).padStart(2, "0")}</div>
        <div className="tb-cell tb-fill tb-hide"><small>DRAWN BY</small>YOU, PROBABLY</div>
        <div className="tb-cell tb-time"><small>TIME</small><Clock /></div>
      </div>
    </header>
  );
}
