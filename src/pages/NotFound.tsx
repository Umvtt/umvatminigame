import { useEffect } from "react";
import { Link } from "react-router-dom";
import HeroMark from "../components/HeroMark";
import SplitText from "../components/SplitText";
import { SITE } from "../site";

export default function NotFound({ message = "We looked everywhere. Even behind the couch." }: { message?: string }) {
  useEffect(() => {
    document.title = `Not found · ${SITE.name}`;
  }, []);
  return (
    <div className="game-page not-found">
      <div className="nf-mark"><HeroMark /></div>
      <p className="eyebrow"><SplitText text="Error 404" idle /></p>
      <h1 className="page-title"><SplitText text="Huh. Nothing here." delay={0.15} /></h1>
      <p className="page-desc fade-up" style={{ animationDelay: ".4s" }}>{message}</p>
      <Link to="/" className="btn fade-up" style={{ animationDelay: ".5s" }} data-magnetic data-ripple>
        <span className="back-arrow" aria-hidden>←</span> Back to the shelf
      </Link>
    </div>
  );
}
