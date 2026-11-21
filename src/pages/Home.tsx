import { useEffect, useMemo, useRef, useState } from "react";
import GameCard from "../components/GameCard";
import { games } from "../games/registry";
import { SITE } from "../site";

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export default function Home() {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

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

  return (
    <>
      <section className="hero">
        <h1>{SITE.name}</h1>
        <p className="hero-desc">{SITE.description}</p>
        <label className="search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            type="search"
            placeholder="Search games"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQ("")}
            aria-label="Search games"
          />
          <kbd aria-hidden>/</kbd>
        </label>
      </section>

      <div className="section-head">
        <h2>All games</h2>
        <span aria-live="polite">{filtered.length} of {games.length}</span>
      </div>
      <section className="grid">
        {filtered.map((g) => <GameCard key={g.slug} game={g} />)}
      </section>
      {filtered.length === 0 && <p className="empty">No games match “{q.trim()}”.</p>}
    </>
  );
}
