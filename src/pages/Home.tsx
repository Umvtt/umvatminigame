import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import GameCard from "../components/GameCard";
import Blobby from "../components/Blobby";
import Roll from "../components/Roll";
import SplitText from "../components/SplitText";
import { reducedMotion } from "../fx/jelly";
import { games } from "../games/registry";
import { useTypewriter } from "../hooks/useTypewriter";
import { SITE } from "../site";

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const LEAVE_MS = 220;
const PHRASES = ["poke around…", ...[...new Set(games.flatMap((g) => g.tags ?? []))].map((t) => `something ${t}?`), "surprise me"];

export default function Home() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLElement>(null);
  const placeholder = useTypewriter(PHRASES, !focused && q === "");

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
    return games.filter((g) =>
      [g.title, g.description, ...(g.tags ?? [])].join(" ").toLowerCase().includes(s),
    );
  }, [q]);

  // Cards that drop out of the filter play an exit animation before they're removed.
  const [shown, setShown] = useState(filtered);
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const keep = new Set(filtered.map((g) => g.slug));
    const out = shown.filter((g) => !keep.has(g.slug)).map((g) => g.slug);
    if (out.length === 0 || reducedMotion()) {
      setLeaving(new Set());
      setShown(filtered);
      return;
    }
    setLeaving(new Set(out));
    const id = window.setTimeout(() => {
      setLeaving(new Set());
      setShown(filtered);
    }, LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [filtered]);

  // FLIP: cards that move because others appeared/disappeared glide to their new spot.
  const positions = useRef(new Map<string, { x: number; y: number }>());
  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const kids = [...el.children] as HTMLElement[];
    const next = new Map<string, { x: number; y: number }>();
    for (const k of kids) {
      const key = k.dataset.key;
      if (!key) continue;
      const now = { x: k.offsetLeft, y: k.offsetTop };
      next.set(key, now);
      const prev = positions.current.get(key);
      if (prev && !reducedMotion() && (prev.x !== now.x || prev.y !== now.y)) {
        k.animate(
          [{ translate: `${prev.x - now.x}px ${prev.y - now.y}px` }, { translate: "0 0" }],
          { duration: 520, easing: "cubic-bezier(.2,.9,.25,1)" },
        );
      }
    }
    positions.current = next;
  }, [shown]);

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1><SplitText text={SITE.name.toLowerCase()} delay={0.1} idle squishy /></h1>
          <p className="hero-desc fade-up" style={{ animationDelay: ".45s" }}>{SITE.description}</p>
          <div className="search-wrap hue-1 fade-up" style={{ animationDelay: ".6s" }}>
            <svg className="drips" aria-hidden>
              <g filter="url(#goo-soft)">
                <rect className="drip-bar" x="22" y="0" height="10" rx="5" />
                <circle className="drip" cx="18%" cy="6" r="6" />
                <circle className="drip" cx="47%" cy="6" r="7" />
                <circle className="drip" cx="78%" cy="6" r="5" />
              </g>
            </svg>
            <label className={`search ${q ? "has-value" : ""}`} data-goo>
              <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={input}
                type="search"
                placeholder={placeholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === "Escape" && setQ("")}
                aria-label="Search games"
              />
              {q ? (
                <button type="button" className="search-clear" onClick={() => { setQ(""); input.current?.focus(); }} aria-label="Clear search">×</button>
              ) : (
                <kbd aria-hidden>/</kbd>
              )}
            </label>
          </div>
        </div>
        <div className="hero-blob">
          <Blobby size={230} />
          <span className="hero-hint" aria-hidden>poke me</span>
        </div>
      </section>

      <div className="section-head fade-up" style={{ animationDelay: ".7s" }}>
        <h2>fresh from the fridge</h2>
        <span aria-live="polite"><Roll value={filtered.length} /> of {games.length} jellies</span>
      </div>
      <section className="grid" ref={grid}>
        {shown.map((g, i) => <GameCard key={g.slug} game={g} order={i} leaving={leaving.has(g.slug)} />)}
      </section>
      {filtered.length === 0 && !leaving.size && (
        <div className="empty">
          <Blobby size={90} mood="lost" />
          <p>No jelly called "{q.trim()}". Yet.</p>
          <button type="button" className="btn" onClick={() => setQ("")} data-jelly data-goo>show them all</button>
        </div>
      )}
    </>
  );
}
