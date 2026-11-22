import type { CSSProperties } from "react";
import type { Game } from "./games/types";
import { games } from "./games/registry";

/** Typed helper for inline CSS custom properties: style={vars({ "--i": 2 })} */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

/** Catalogue number, e.g. "01". */
export const numberOf = (game: Game) => String(games.indexOf(game) + 1).padStart(2, "0");
