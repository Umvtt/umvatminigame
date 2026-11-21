import { Suspense, lazy, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import GameFrame from "../components/GameFrame";
import { getGame } from "../games/registry";

export default function Play() {
  const { slug = "" } = useParams();
  const game = getGame(slug);
  const Component = useMemo(() => (game?.component ? lazy(game.component) : null), [game]);

  if (!game || !Component) return <Navigate to="/404" replace />;

  return (
    <GameFrame game={game}>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <Component />
      </Suspense>
    </GameFrame>
  );
}
