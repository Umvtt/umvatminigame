import { Suspense, lazy, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
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

  if (!game) return <NotFound message="There's no game at this address." />;

  return (
    <GameFrame game={game}>
      {Component ? (
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <Component />
        </Suspense>
      ) : (
        <div className="center">
          <p className="muted">This game isn't ready yet. Check back soon.</p>
          <Link to="/" className="btn">Browse other games</Link>
        </div>
      )}
    </GameFrame>
  );
}
