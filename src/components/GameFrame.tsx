import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import { hueOf } from "./GameCard";
import SplitText from "./SplitText";

/** Shared page chrome for every minigame: the game is served on a plate. */
export default function GameFrame({ game, children }: { game: Game; children: ReactNode }) {
  return (
    <div className={`game-page ${hueOf(game)}`}>
      <Link to="/" className="back" data-jelly><span className="back-arrow" aria-hidden>←</span> back to the fridge</Link>
      <h1 className="page-title"><SplitText text={game.title.toLowerCase()} delay={0.1} squishy /></h1>
      <p className="page-desc fade-up" style={{ animationDelay: ".35s" }}>{game.description}</p>
      <div className="plate">{children}</div>
    </div>
  );
}
