import { Link } from "react-router-dom";
import { SITE } from "../site";

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-mark" aria-hidden>🎮</span>
        {SITE.name}
      </Link>
    </header>
  );
}
