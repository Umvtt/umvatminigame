import { Link } from "react-router-dom";
import type { Game } from "../games/types";

export default function GameCard({ game }: { game: Game }) {
  const playable = !!game.component;
  const body = (
    <>
      <div className="card-emoji" aria-hidden>{game.emoji}</div>
      <h3>{game.title}</h3>
      <p>{game.description}</p>
      {!playable && <span className="badge">Coming soon</span>}
    </>
  );

  return playable ? (
    <Link to={`/play/${game.slug}`} className="card" style={{ background: game.color }}>
      {body}
    </Link>
  ) : (
    <div className="card card-soon" style={{ background: game.color }} aria-disabled>
      {body}
    </div>
  );
}
