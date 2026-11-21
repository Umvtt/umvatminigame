import { useMemo, useState } from "react";
import GameCard from "../components/GameCard";
import { games } from "../games/registry";
import { SITE } from "../site";

export default function Home() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return games;
    return games.filter((g) =>
      [g.title, g.description, ...(g.tags ?? [])].join(" ").toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <main>
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p>{SITE.description}</p>
        <input
          className="search"
          type="search"
          placeholder="Search games…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search games"
        />
      </section>
      <section className="grid">
        {filtered.map((g) => <GameCard key={g.slug} game={g} />)}
        {filtered.length === 0 && <p className="muted">No games match “{q}”.</p>}
      </section>
    </main>
  );
}
