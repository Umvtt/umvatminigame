import type { Game } from "./types";

/**
 * ADD NEW MINIGAMES HERE.
 *
 * 1. Create src/games/<slug>/index.tsx with a default-exported React component.
 * 2. Add an entry below with `component: () => import("./<slug>")`.
 *
 * Entries without `component` render as "coming soon" cards.
 */
export const games: Game[] = [
  {
    slug: "click-speed",
    title: "Click Speed",
    description: "How many clicks can you land in 10 seconds?",
    emoji: "🖱️",
    color: "#ffe29a",
    tags: ["reflex"],
    component: () => import("./click-speed"),
  },
  {
    slug: "reaction-time",
    title: "Reaction Time",
    description: "Wait for green. Click. Don't be early.",
    emoji: "⚡",
    color: "#b8f2c9",
    tags: ["reflex"],
  },
  {
    slug: "memory-grid",
    title: "Memory Grid",
    description: "Remember the pattern. Repeat it. Harder every round.",
    emoji: "🧠",
    color: "#cfd8ff",
    tags: ["memory"],
  },
  {
    slug: "typing-sprint",
    title: "Typing Sprint",
    description: "Type the words before the clock runs out.",
    emoji: "⌨️",
    color: "#ffc9d9",
    tags: ["typing"],
  },
];

export const getGame = (slug: string) => games.find((g) => g.slug === slug);
