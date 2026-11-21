import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../site";

export default function NotFound({ message = "This page doesn't exist." }: { message?: string }) {
  useEffect(() => {
    document.title = `Not found · ${SITE.name}`;
  }, []);
  return (
    <div className="game-page not-found">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Nothing here</h1>
      <p className="page-desc">{message}</p>
      <Link to="/" className="btn">← Back to all games</Link>
    </div>
  );
}
