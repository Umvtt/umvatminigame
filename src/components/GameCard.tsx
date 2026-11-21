import { Link } from "react-router-dom";
import { poke } from "../fx/jelly";
import { games } from "../games/registry";
import type { Game } from "../games/types";
import { useReveal } from "../hooks/useReveal";
import { vars } from "../util";
import Art from "./Art";

export const hueOf = (game: Game) => `hue-${games.indexOf(game) % 4}`;

export default function GameCard({ game, order, leaving }: { game: Game; order: number; leaving?: boolean }) {
  const playable = Boolean(game.component);
  const delay = Math.min(order, 8) * 90;
  // When the card lands on screen it plops down with a wobble.
  const ref = useReveal<HTMLDivElement>((el) => {
    window.setTimeout(() => poke(el.querySelector<HTMLElement>(".card"), 0.16), delay + 420);
  });
  const no = String(games.indexOf(game) + 1).padStart(2, "0");

  const body = (
    <>
      <span className="gloss" aria-hidden />
      <div className="card-art">
        <Art name={game.art} />
        {!playable && (
          <span className="peeper" data-eyes aria-hidden>
            <i /><i />
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>no.{no}</span>
          <span>{(game.tags ?? []).join(" · ")}</span>
        </div>
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        {playable ? (
          <span className="card-cta">play <span className="cta-arrow" aria-hidden>→</span></span>
        ) : (
          <span className="card-setting">still setting<span className="dots" aria-hidden><i>.</i><i>.</i><i>.</i></span></span>
        )}
      </div>
    </>
  );
  return (
    <div
      ref={ref}
      data-key={game.slug}
      className={`card-shell reveal ${leaving ? "is-leaving" : ""}`}
      style={vars({ "--delay": `${delay}ms` })}
    >
      {playable ? (
        <Link to={`/play/${game.slug}`} className={`card ${hueOf(game)}`} data-jelly data-goo>{body}</Link>
      ) : (
        <div className={`card card-soon ${hueOf(game)}`} data-jelly data-goo data-shy>{body}</div>
      )}
    </div>
  );
}
