import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import { vars } from "../util";
import Art from "./Art";

export default function GameCard({ game, index }: { game: Game; index: number }) {
  const fig = String(index + 1).padStart(2, "0");
  const body = (
    <>
      <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
      <div className="plate-head">
        <span>FIG. {fig}</span>
        <span>{(game.tags ?? ["misc"]).join(" / ").toUpperCase()}</span>
      </div>
      <Art name={game.art} />
      <div className="plate-foot">
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        {!game.component && <span className="void-stamp">Under review</span>}
        <span className="go">{game.component ? "PLAY" : "LOCKED"} <b aria-hidden>▸</b></span>
      </div>
    </>
  );
  const style = vars({ "--i": index });
  return game.component ? (
    <Link to={`/play/${game.slug}`} className="plate" style={style}>{body}</Link>
  ) : (
    <div className="plate plate-soon" style={style} aria-disabled>{body}</div>
  );
}
