import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { SITE } from "../site";

export function Logo() {
  return (
    <svg viewBox="0 0 66 66" width="40" height="40" aria-hidden>
      <path d="M34.0 7.0 L40.2 15.0 L49.9 12.2 L50.2 22.2 L59.7 25.7 L54.0 34.0 L59.7 42.3 L50.2 45.8 L49.9 55.8 L40.2 53.0 L34.0 61.0 L27.8 53.0 L18.1 55.8 L17.8 45.8 L8.3 42.3 L14.0 34.0 L8.3 25.7 L17.8 22.2 L18.1 12.2 L27.8 15.0 Z" fill="#14110f" stroke="#14110f" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M30.0 3.0 L36.2 11.0 L45.9 8.2 L46.2 18.2 L55.7 21.7 L50.0 30.0 L55.7 38.3 L46.2 41.8 L45.9 51.8 L36.2 49.0 L30.0 57.0 L23.8 49.0 L14.1 51.8 L13.8 41.8 L4.3 38.3 L10.0 30.0 L4.3 21.7 L13.8 18.2 L14.1 8.2 L23.8 11.0 Z" fill="#ffc933" stroke="#14110f" strokeWidth="4" strokeLinejoin="round"/>
      <ellipse cx="22.5" cy="26" rx="3" ry="4.2" fill="#14110f"/><ellipse cx="37.5" cy="26" rx="3" ry="4.2" fill="#14110f"/>
      <path d="M21 36 Q30 43 39 35" fill="none" stroke="#14110f" strokeWidth="3.5" strokeLinecap="round"/>
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
