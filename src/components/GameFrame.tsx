import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { games } from "../games/registry";
import type { Game } from "../games/types";

/** Shared page chrome for every minigame. */
export default function GameFrame({ game, children }: { game: Game; children: ReactNode }) {
  const fig = String(games.indexOf(game) + 1).padStart(2, "0");
  return (
    <main className="wrap game-page">
      <Link to="/" className="back">◂ INDEX</Link>
      <div className="game-meta">FIG. {fig} · {(game.tags ?? []).join(" / ").toUpperCase()}</div>
      <h1 className="game-title">{game.title}</h1>
      <p className="game-desc">{game.description}</p>
      <div className="plate stage">
        <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
        {children}
      </div>
    </main>
  );
}
