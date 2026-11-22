import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../site";
import { vars } from "../util";

export default function NotFound({ message = "The page you were looking for doesn't exist or has moved." }: { message?: string }) {
  useEffect(() => {
    document.title = `Not found — ${SITE.name}`;
  }, []);
  return (
    <div className="game-page not-found">
      <p className="eyebrow mono fade-in">Error 404</p>
      <h1 className="display display-sm">
        <span className="line" style={vars({ "--i": 0 })}><span>Page not found.</span></span>
      </h1>
      <p className="lede fade-in" style={vars({ "--delay": "0.35s" })}>{message}</p>
      <Link to="/" className="button fade-in" style={vars({ "--delay": "0.45s" })}>Return to index <span className="arrow" aria-hidden>→</span></Link>
    </div>
  );
}
