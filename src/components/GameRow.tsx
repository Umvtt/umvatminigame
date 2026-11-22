import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import type { Hovered } from "./Preview";
import { useReveal } from "../hooks/useReveal";
import { numberOf, vars } from "../util";
import Art from "./Art";

/** One entry in the index. Available games link to their page; the rest are listed but inert. */
export default function GameRow({ game, order, onHover }: { game: Game; order: number; onHover: (h: Hovered) => void }) {
  const playable = Boolean(game.component);
  const ref = useReveal<HTMLLIElement>();
  const body = (
    <>
      <span className="row-no mono">{numberOf(game)}</span>
      <span className="row-main">
        <span className="row-title">{game.title}</span>
        <span className="row-desc">{game.description}</span>
      </span>
      <span className="row-tag mono">{(game.tags ?? []).join(", ")}</span>
      <span className="row-status mono">
        <i className={`dot ${playable ? "is-on" : ""}`} aria-hidden />
        {playable ? "Available" : "In development"}
      </span>
      {playable ? (
        <span className="row-go" aria-hidden>Play <span className="arrow">→</span></span>
      ) : (
        <span className="row-go is-soon" aria-hidden>Soon</span>
      )}
      <span className="row-thumb" aria-hidden><Art name={game.art} /></span>
    </>
  );
  return (
    <li
      ref={ref}
      className="row reveal"
      style={vars({ "--delay": `${0.15 + Math.min(order, 8) * 0.07}s` })}
      onMouseEnter={(e) => onHover({ game, row: e.currentTarget })}
      onFocus={(e) => onHover({ game, row: e.currentTarget })}
    >
      {playable ? (
        <Link to={`/play/${game.slug}`} className="row-link">{body}</Link>
      ) : (
        <div className="row-link is-soon" aria-disabled="true">{body}</div>
      )}
    </li>
  );
}
