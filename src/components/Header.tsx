import { Link } from "react-router-dom";
import { SITE } from "../site";

/** Hex nut + crosshair mark. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="mark">
      <polygon points="58,32 45,54.5 19,54.5 6,32 19,9.5 45,9.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="32" cy="32" r="4.5" className="mark-dot" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="brand">
          <Logo />
          <span>{SITE.name}</span>
        </Link>
        <span className="tagline">{SITE.tagline}</span>
      </div>
    </header>
  );
}
