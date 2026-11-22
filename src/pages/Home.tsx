import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GameRow from "../components/GameRow";
import Preview, { type Hovered } from "../components/Preview";
import Roll from "../components/Roll";
import { games } from "../games/registry";
import { SITE } from "../site";
import { vars } from "../util";

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<Hovered>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${SITE.name} — ${SITE.tagline}`;
  }, []);

  // Press "/" to focus search (but never steal it while the user is typing elsewhere)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || isEditable(e.target)) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return games;
    return games.filter((g) => [g.title, g.description, ...(g.tags ?? [])].join(" ").toLowerCase().includes(s));
  }, [q]);

  const available = games.filter((g) => g.component).length;
  const featured = games.find((g) => g.component);

  return (
    <>
      <section className="hero">
        <p className="eyebrow mono fade-in" style={vars({ "--delay": "0.05s" })}>{SITE.name} — {SITE.tagline}</p>
        <h1 className="display">
          <span className="line" style={vars({ "--i": 0 })}><span>Small games,</span></span>
          <span className="line" style={vars({ "--i": 1 })}><span className="muted">made with care.</span></span>
        </h1>
        <div className="hero-foot">
          <div className="fade-in" style={vars({ "--delay": "0.45s" })}>
            <p className="lede">{SITE.description}</p>
            <div className="actions">
              {featured && (
                <Link to={`/play/${featured.slug}`} className="button">
                  Play {featured.title} <span className="arrow" aria-hidden>→</span>
                </Link>
              )}
              <a href="#index" className="button button-ghost" onClick={(e) => { e.preventDefault(); document.getElementById("index")?.scrollIntoView({ behavior: "smooth" }); }}>
                Browse the index <span className="arrow down" aria-hidden>↓</span>
              </a>
            </div>
          </div>
          <dl className="facts mono fade-in" style={vars({ "--delay": "0.55s" })}>
            <div><dt>Available</dt><dd>{pad(available)}</dd></div>
            <div><dt>In development</dt><dd>{pad(games.length - available)}</dd></div>
            <div><dt>Price</dt><dd>Free</dd></div>
          </dl>
        </div>
      </section>

      <section className="index" id="index" aria-labelledby="index-title">
        <div className="index-bar fade-in" style={vars({ "--delay": "0.65s" })}>
          <h2 id="index-title" className="eyebrow mono">Index</h2>
          <label className="search">
            <span className="visually-hidden">Search games</span>
            <svg className="search-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden>
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={input}
              type="search"
              placeholder="Search games"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
            />
            <kbd className="mono" aria-hidden>/</kbd>
          </label>
          <span className="count mono" aria-live="polite"><Roll value={pad(filtered.length)} /> / {pad(games.length)}</span>
        </div>
        <ul className="rows" onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)}>
          {filtered.map((g, i) => <GameRow key={g.slug} game={g} order={i} onHover={setHover} />)}
        </ul>
        {filtered.length === 0 && (
          <p className="empty">
            Nothing matches “{q.trim()}”.{" "}
            <button type="button" className="button button-ghost button-sm" onClick={() => setQ("")}>Clear search</button>
          </p>
        )}
      </section>
      <Preview hovered={hover} />
    </>
  );
}
