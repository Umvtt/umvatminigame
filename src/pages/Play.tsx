import { Suspense, lazy, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Art from "../components/Art";
import GameFrame from "../components/GameFrame";
import { getGame } from "../games/registry";
import { SITE } from "../site";
import NotFound from "./NotFound";

export default function Play() {
  const { slug = "" } = useParams();
  const game = getGame(slug);
  const Component = useMemo(() => (game?.component ? lazy(game.component) : null), [game]);

  useEffect(() => {
    if (game) document.title = `${game.title} — ${SITE.name}`;
  }, [game]);

  if (!game) return <NotFound message="There's no game at this address." />;

  return (
    <GameFrame game={game}>
      {Component ? (
        <Suspense fallback={<div className="loader mono" aria-label="Loading">Loading</div>}>
          <Component />
        </Suspense>
      ) : (
        <div className="soon">
          <div className="soon-art"><Art name={game.art} /></div>
          <div>
            <p className="eyebrow mono">In development</p>
            <p className="lede">This one isn't finished yet. It will appear in the index as soon as it's ready.</p>
            <Link to="/" className="button">Return to index <span aria-hidden>→</span></Link>
          </div>
        </div>
      )}
    </GameFrame>
  );
}
