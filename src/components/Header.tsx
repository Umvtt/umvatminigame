import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { SITE } from "../site";

export function Logo() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
      <rect x="3" y="3" width="34" height="34" rx="9" fill="#ff5a36" stroke="#14110f" strokeWidth="3.5" />
      <path d="M12 12 V22 a8 8 0 0 0 16 0 V12" fill="none" stroke="#fffaf0" strokeWidth="5" strokeLinecap="round" />
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
