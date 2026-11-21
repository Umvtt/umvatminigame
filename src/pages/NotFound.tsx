import { useEffect } from "react";
import { Link } from "react-router-dom";
import Blobby from "../components/Blobby";
import SplitText from "../components/SplitText";
import { SITE } from "../site";

export default function NotFound({ message = "This jelly slid right off the plate. It's not here." }: { message?: string }) {
  useEffect(() => {
    document.title = `Not found · ${SITE.name}`;
  }, []);
  return (
    <div className="game-page not-found hue-0">
      <Blobby size={150} mood="lost" className="nf-blob" />
      <p className="eyebrow">404</p>
      <h1 className="page-title"><SplitText text="oops, splat." delay={0.15} squishy /></h1>
      <p className="page-desc fade-up" style={{ animationDelay: ".4s" }}>{message}</p>
      <Link to="/" className="btn fade-up" style={{ animationDelay: ".5s" }} data-jelly data-goo>
        <span className="back-arrow" aria-hidden>←</span> back to the fridge
      </Link>
    </div>
  );
}
