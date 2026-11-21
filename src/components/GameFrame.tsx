import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import SplitText from "./SplitText";

/** Shared page chrome for every minigame. */
export default function GameFrame({ game, children }: { game: Game; children: ReactNode }) {
  return (
    <div className="game-page">
      <Link to="/" className="back"><span className="back-arrow" aria-hidden>←</span> All games</Link>
      <h1 className="page-title"><SplitText text={game.title} delay={0.1} /></h1>
      <p className="page-desc fade-up" style={{ animationDelay: ".35s" }}>{game.description}</p>
      <div className="stage">{children}</div>
    </div>
  );
}
