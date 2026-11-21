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
    if (game) document.title = `${game.title} · ${SITE.name}`;
    return () => {
      document.title = SITE.name;
    };
  }, [game]);

  if (!game) return <NotFound message="There's no game at this address. Maybe it melted." />;

  return (
    <GameFrame game={game}>
      {Component ? (
        <Suspense fallback={<div className="loader" aria-label="Loading"><i /><i /><i /></div>}>
          <Component />
        </Suspense>
      ) : (
        <div className="center soon">
          <div className="soon-art"><Art name={game.art} /></div>
          <p className="muted">Still setting in the fridge. Come back when it's wobbly.</p>
          <Link to="/" className="btn" data-jelly data-goo>play something else</Link>
        </div>
      )}
    </GameFrame>
  );
}
