import type { CSSProperties, PointerEvent } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import Art from "./Art";

/** Tilts toward the cursor and moves a light sheen under it. */
function track(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
  el.style.setProperty("--rx", `${-(y - 0.5) * 12}deg`);
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
}
function reset(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

export default function GameCard({ game, index }: { game: Game; index: number }) {
  const style = { "--c": game.color, "--i": index, "--tilt": `${index % 2 ? 0.7 : -0.7}deg` } as CSSProperties;
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
  const handlers = { onPointerMove: track, onPointerLeave: reset };

  return game.component ? (
    <Link to={`/play/${game.slug}`} className="card" style={style} {...handlers}>{body}</Link>
  ) : (
    <div className="card card-soon" style={style} aria-disabled {...handlers}>{body}</div>
  );
}
