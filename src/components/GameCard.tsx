import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import { useReveal } from "../hooks/useReveal";
import { vars } from "../util";
import Art from "./Art";

export default function GameCard({ game, order, leaving }: { game: Game; order: number; leaving?: boolean }) {
  const playable = Boolean(game.component);
  const ref = useReveal<HTMLDivElement>();
  const body = (
    <>
      <span className="card-glow" aria-hidden />
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
        {playable && (
          <span className="card-cta">
            Play <span className="cta-arrow" aria-hidden>→</span>
          </span>
        )}
      </div>
    </>
  );
  return (
    <div
      ref={ref}
      data-key={game.slug}
      className={`card-shell reveal ${leaving ? "is-leaving" : ""}`}
      style={vars({ "--delay": `${Math.min(order, 8) * 80}ms` })}
    >
      {playable ? (
        <Link to={`/play/${game.slug}`} className="card" data-tilt data-ripple>{body}</Link>
      ) : (
        <div className="card card-soon" data-tilt>{body}</div>
      )}
    </div>
  );
}
