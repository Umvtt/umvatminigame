import type { ReactElement } from "react";

/**
 * Hand-built SVG illustrations, one per game. Add a new one here and
 * reference its key from `art` in src/games/registry.ts.
 */
const INK = "#14110f";
const W = { fill: "#fffaf0" };
const line = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export const ART: Record<string, ReactElement> = {
  cursor: (
    <>
      <circle cx="58" cy="52" r="30" fill="#ff5a36" {...line} />
      <path d="M44 28 L44 78 L57 66 L66 86 L75 82 L66 62 L84 62 Z" {...W} {...line} />
      <path d="M92 22 L100 12 M100 36 L112 34 M84 14 L84 4" {...line} fill="none" />
    </>
  ),
  bolt: (
    <>
      <circle cx="60" cy="48" r="34" fill="#fffaf0" {...line} />
      <path d="M68 8 L36 54 L56 54 L48 88 L84 38 L62 38 Z" fill="#ffc933" {...line} />
      <path d="M100 30 Q108 48 100 66" fill="none" {...line} />
      <path d="M108 22 Q120 48 108 74" fill="none" {...line} />
    </>
  ),
  grid: (
    <>
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => {
          const on = (r * 3 + c) % 4 === 1 || (r === 2 && c === 2);
          return (
            <rect
              key={`${r}${c}`}
              x={22 + c * 26}
              y={8 + r * 26}
              width="22"
              height="22"
              rx="5"
              fill={on ? "#4f6bff" : "#fffaf0"}
              {...line}
            />
          );
        }),
      )}
    </>
  ),
  keys: (
    <>
      <rect x="10" y="12" width="40" height="34" rx="8" fill="#fffaf0" {...line} />
      <rect x="58" y="12" width="40" height="34" rx="8" fill="#ff5a36" {...line} />
      <rect x="22" y="52" width="76" height="34" rx="8" fill="#fffaf0" {...line} />
      <path d="M22 32 H38 M70 32 H86 M42 70 H78" {...line} fill="none" />
    </>
  ),
};

export default function Art({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 120 96" role="img" aria-hidden className="art">
      {ART[name] ?? <circle cx="60" cy="48" r="30" fill="#fffaf0" {...line} />}
    </svg>
  );
}
