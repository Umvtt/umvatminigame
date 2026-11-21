import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { SITE } from "../site";

export default function Header() {
  const playable = games.filter((g) => g.component).length;
  return (
    <header className="header">
      <div className="wrap">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden />
          {SITE.name}
        </Link>
        <span className="pill">{playable} playable</span>
      </div>
    </header>
  );
}
