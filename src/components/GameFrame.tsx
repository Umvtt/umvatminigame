import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../games/types";
import { numberOf, vars } from "../util";

/** Shared page chrome for every game. */
export default function GameFrame({ game, children }: { game: Game; children: ReactNode }) {
  return (
    <div className="game-page">
      <Link to="/" className="back mono"><span aria-hidden>←</span> Index</Link>
      <header className="game-head">
        <p className="eyebrow mono fade-in" style={vars({ "--delay": "0.05s" })}>
          No. {numberOf(game)} — {(game.tags ?? []).join(", ")}
        </p>
        <h1 className="display display-sm">
          <span className="line" style={vars({ "--i": 0 })}><span>{game.title}</span></span>
        </h1>
        <p className="lede fade-in" style={vars({ "--delay": "0.35s" })}>{game.description}</p>
      </header>
      <div className="stage fade-in" style={vars({ "--delay": "0.45s" })}>{children}</div>
    </div>
  );
}
