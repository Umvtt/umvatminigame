import type { ReactElement } from "react";
import { vars } from "../util";

/**
 * Blueprint-style line drawings, one per game (viewBox 160x110).
 *  - .draw   : plotted on load (stroke-dash draw-in)
 *  - .part   : exploded at rest, snaps together on plate hover (--ex/--ey)
 *  - .y      : yellow highlight stroke
 *  - .hatch  : yellow hatch fill, .solid: fill matches paper
 * Add a new one here, then use its key as `art` in src/games/registry.ts.
 */
const ex = (x: number, y: number) => vars({ "--ex": `${x}px`, "--ey": `${y}px` });
const d = (s: number) => vars({ "--d": `${s}s` });

export const ART: Record<string, ReactElement> = {
  cursor: (
    <>
      <g className="part" style={ex(-7, 6)}>
        <circle className="draw" pathLength={1} cx="62" cy="56" r="34" />
        <circle className="fade dash" cx="62" cy="56" r="24" />
      </g>
      <g className="part" style={ex(9, -8)}>
        <g className="a-arrow">
          <polygon className="draw y solid" style={d(0.3)} pathLength={1} points="58,34 58,88 72,76 82,98 92,93 82,71 101,71" />
        </g>
      </g>
      <g className="part" style={ex(10, 8)}>
        <path className="draw y a-burst" pathLength={1} d="M108 38 L120 26" />
        <path className="draw y a-burst" style={{ animationDelay: ".1s" }} pathLength={1} d="M114 56 L130 54" />
        <path className="draw y a-burst" style={{ animationDelay: ".2s" }} pathLength={1} d="M96 26 L96 12" />
      </g>
      <path className="draw" style={d(0.5)} pathLength={1} d="M28 104 H96 M28 100 V108 M96 100 V108" />
      <text x="62" y="102" textAnchor="middle" className="lbl">10 SEC</text>
      <path className="draw" style={d(0.6)} pathLength={1} d="M102 90 L128 80 H152" />
      <text x="154" y="78" className="lbl" textAnchor="end">A: PTR</text>
    </>
  ),
  bolt: (
    <>
      <g className="part" style={ex(-6, 0)}>
        <circle className="draw" pathLength={1} cx="66" cy="55" r="38" />
        <circle className="fade dash" cx="66" cy="55" r="46" />
      </g>
      <g className="part" style={ex(6, -4)}>
        <g className="a-bolt">
          <polygon className="draw y hatch" style={d(0.3)} pathLength={1} points="76,10 44,60 64,60 56,100 94,46 72,46" />
        </g>
      </g>
      <g className="part" style={ex(12, 0)}>
        <path className="draw a-wave" pathLength={1} d="M118 36 Q128 55 118 74" />
        <path className="draw a-wave" style={{ animationDelay: ".15s" }} pathLength={1} d="M128 28 Q142 55 128 82" />
      </g>
      <path className="draw" style={d(0.6)} pathLength={1} d="M30 18 L12 10 H4" />
      <text x="4" y="8" className="lbl">T=0.2S</text>
    </>
  ),
  grid: (
    <>
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => {
          const i = r * 3 + c;
          const on = i % 4 === 1 || i === 8;
          return (
            <g key={i} className="part" style={ex((c - 1) * 6, (r - 1) * 6)}>
              <g className="a-sq" style={{ animationDelay: `${i * 0.12}s` }}>
                <rect
                  className={`draw ${on ? "y hatch" : ""}`}
                  style={d(i * 0.05)}
                  pathLength={1}
                  x={32 + c * 30}
                  y={10 + r * 30}
                  width="24"
                  height="24"
                  rx="2"
                />
              </g>
            </g>
          );
        }),
      )}
      <path className="draw" style={d(0.6)} pathLength={1} d="M32 104 H116 M32 100 V108 M116 100 V108" />
      <text x="74" y="102" textAnchor="middle" className="lbl">3 × 3</text>
      <path className="draw" style={d(0.6)} pathLength={1} d="M128 22 H150 M128 18 V26" />
      <text x="150" y="18" textAnchor="end" className="lbl">SEQ</text>
    </>
  ),
  keys: (
    <>
      <g className="part" style={ex(-6, -6)}>
        <g className="a-key">
          <rect className="draw solid" pathLength={1} x="14" y="14" width="40" height="34" rx="5" />
          <text x="34" y="36" textAnchor="middle" className="lbl big">A</text>
        </g>
      </g>
      <g className="part" style={ex(0, -8)}>
        <g className="a-key" style={{ animationDelay: ".2s" }}>
          <rect className="draw y hatch" style={d(0.2)} pathLength={1} x="60" y="14" width="40" height="34" rx="5" />
        </g>
      </g>
      <g className="part" style={ex(6, -6)}>
        <g className="a-key" style={{ animationDelay: ".4s" }}>
          <rect className="draw solid" style={d(0.1)} pathLength={1} x="106" y="14" width="40" height="34" rx="5" />
          <text x="126" y="36" textAnchor="middle" className="lbl big">Z</text>
        </g>
      </g>
      <g className="part" style={ex(0, 8)}>
        <g className="a-key" style={{ animationDelay: ".3s" }}>
          <rect className="draw solid" style={d(0.4)} pathLength={1} x="30" y="56" width="100" height="34" rx="5" />
          <text x="80" y="77" textAnchor="middle" className="lbl">SPACE</text>
        </g>
      </g>
      <path className="draw" style={d(0.6)} pathLength={1} d="M14 100 H146 M14 96 V104 M146 96 V104" />
    </>
  ),
};

export default function Art({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 160 110" role="img" aria-hidden className="art">
      {ART[name] ?? <circle className="draw" pathLength={1} cx="80" cy="55" r="34" />}
    </svg>
  );
}
