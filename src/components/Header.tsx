import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../site";

/** Hex nut + crosshair mark. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="mark">
      <polygon className="mark-hex" points="58,32 45,54.5 19,54.5 6,32 19,9.5 45,9.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="32" cy="32" r="4.5" className="mark-dot" />
    </svg>
  );
}

/** Sticky header: gains a frosted background once scrolled, tucks away while scrolling down. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 120);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="wrap header-inner">
        <Link to="/" className="brand">
          <Logo />
          <span className="brand-name">
            {[...SITE.name].map((ch, i) => (
              <span key={i} style={{ transitionDelay: `${i * 30}ms` }}>{ch}</span>
            ))}
          </span>
        </Link>
        <span className="tagline">{SITE.tagline}</span>
      </div>
      <div className="scroll-progress" aria-hidden />
    </header>
  );
}
