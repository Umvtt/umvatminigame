import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import Art from "./Art";

export default function GameCard({ game, index }: { game: Game; index: number }) {
  const style = { "--c": game.color, "--tilt": `${index % 2 ? 0.6 : -0.6}deg` } as CSSProperties;
  const body = (
    <>
      <span className="card-num">{String(index + 1).padStart(2, "0")}</span>
      {!game.component && <span className="stamp">Soon</span>}
      <Art name={game.art} />
      <div className="card-text">
        <h3>{game.title}</h3>
        <p>{game.description}</p>
      </div>
    </>
  );

  return game.component ? (
    <Link to={`/play/${game.slug}`} className="card" style={style}>{body}</Link>
  ) : (
    <div className="card card-soon" style={style} aria-disabled>{body}</div>
  );
}
