import { useEffect, useMemo, useRef, useState } from "react";
import GameCard from "../components/GameCard";
import { games } from "../games/registry";
import { SITE } from "../site";

export default function Home() {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // Press "/" to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== input.current) {
        e.preventDefault();
        input.current?.focus();
      }
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
    <main className="wrap">
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p>{SITE.description}</p>
        <div className="search-wrap">
          <input
            ref={input}
            className="search"
            type="search"
            placeholder="Search games"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search games"
          />
          <span className="kbd" aria-hidden>/</span>
        </div>
      </section>
      <div className="section-label">All games · {filtered.length}</div>
      <section className="grid">
        {filtered.map((g) => <GameCard key={g.slug} game={g} />)}
        {filtered.length === 0 && <p className="empty">No games match “{q}”.</p>}
      </section>
    </main>
  );
}
