import { useEffect, useMemo, useRef, useState } from "react";
import GameCard from "../components/GameCard";
import Tape from "../components/Tape";
import { games } from "../games/registry";
import { SITE } from "../site";
import { vars } from "../util";

export default function Home() {
  const [q, setQ] = useState("");
  const [w, setW] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  // Live-measure the title for its dimension line
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.round(el.getBoundingClientRect().width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    <>
      <main className="wrap">
        <section className="hero">
          <div className="hero-meta">DWG NO. D-0001 &nbsp;·&nbsp; {SITE.tagline.toUpperCase()}</div>
          <div ref={wrap} className="title-wrap">
            <h1 aria-label={SITE.name}>
              {SITE.name.toUpperCase().split("").map((ch, i) => (
                <span key={i} className="ltr" style={vars({ "--n": i })} aria-hidden>{ch}</span>
              ))}
            </h1>
            <div className="dim" aria-hidden>
              <span>{w} UNITS</span>
            </div>
          </div>
          <div className="stamp-big" aria-hidden>Patent<br />pending</div>
          <p className="hero-desc">{SITE.description}</p>
          <label className="search">
            <span aria-hidden>&gt;</span>
            <input
              ref={input}
              type="search"
              placeholder="FIND A DOODAD"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search games"
            />
            <kbd aria-hidden>/</kbd>
          </label>
        </section>
      </main>
      <Tape />
      <main className="wrap">
        <div className="index-head"><span>INDEX OF DRAWINGS</span><i /><span>{String(filtered.length).padStart(2, "0")}</span></div>
        <section className="grid">
          {filtered.map((g) => <GameCard key={g.slug} game={g} index={games.indexOf(g)} />)}
          {filtered.length === 0 && <p className="empty">NO DRAWINGS MATCH “{q.toUpperCase()}”.</p>}
        </section>
      </main>
    </>
  );
}
