import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import Art from "./Art";

export default function GameCard({ game }: { game: Game }) {
  const playable = Boolean(game.component);
  const body = (
    <>
      <div className="card-art">
        <Art name={game.art} />
      </div>
      <div className="card-body">
        <div className="card-meta">
          {(game.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
          {!playable && <span className="tag tag-soon">Coming soon</span>}
        </div>
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        {playable && <span className="card-cta">Play <span aria-hidden>→</span></span>}
      </div>
    </>
  );
  return playable ? (
    <Link to={`/play/${game.slug}`} className="card">{body}</Link>
  ) : (
    <div className="card card-soon">{body}</div>
  );
}
