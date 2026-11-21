import type { ComponentType } from "react";

export type Game = {
  /** URL slug: the game lives at /play/<slug> */
  slug: string;
  title: string;
  description: string;
  /** Shown on the card */
  emoji: string;
  /** Card background color */
  color: string;
  /** Lazy-loaded game component. Omit for a "coming soon" card. */
  component?: () => Promise<{ default: ComponentType }>;
  tags?: string[];
};
