import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";

export default function GameCard({ game }: { game: Game }) {
  const style = { "--c": game.color } as CSSProperties;
  const body = (
    <>
      <div className="card-top">
        <div className="card-emoji" aria-hidden>{game.emoji}</div>
        {game.component ? <span className="arrow" aria-hidden>→</span> : <span className="badge">Soon</span>}
      </div>
      <h3>{game.title}</h3>
      <p>{game.description}</p>
    </>
  );

  return game.component ? (
    <Link to={`/play/${game.slug}`} className="card" style={style}>{body}</Link>
  ) : (
    <div className="card card-soon" style={style} aria-disabled>{body}</div>
  );
}
