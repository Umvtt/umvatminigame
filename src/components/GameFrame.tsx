import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";

/** Shared page chrome for every minigame. */
export default function GameFrame({ game, children }: { game: Game; children: ReactNode }) {
  return (
    <main className="game-page">
      <Link to="/" className="back">← All games</Link>
      <h1>{game.emoji} {game.title}</h1>
      <p className="muted">{game.description}</p>
      <div className="game-stage">{children}</div>
    </main>
  );
}
