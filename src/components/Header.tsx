import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { SITE } from "../site";
import Mark from "./Mark";

function LocalTime() {
  const fmt = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return <time>{t}</time>;
}

export default function Header() {
  const available = games.filter((g) => g.component).length;
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="brand">
          <Mark />
          <span>{SITE.name}</span>
        </Link>
        <div className="header-meta mono">
          <span className="hide-sm">{String(available).padStart(2, "0")} of {String(games.length).padStart(2, "0")} available</span>
          <span className="sep hide-sm" aria-hidden />
          <span>Local <LocalTime /></span>
        </div>
      </div>
    </header>
  );
}
