/** Large animated logo for the hero: counter-rotating rings, orbiting dots, pulsing core, pointer parallax. */
export default function HeroMark() {
  return (
    <div className="hero-mark" aria-hidden>
      <svg viewBox="0 0 200 200">
        <circle className="hm-ring hm-dash" cx="100" cy="100" r="92" />
        <g className="hm-orbit">
          <circle className="hm-sat" cx="100" cy="8" r="4" />
          <circle className="hm-sat hm-sat-2" cx="8" cy="100" r="2.5" />
        </g>
        <g className="hm-spin">
          <polygon className="hm-hex" points="172,100 136,162.4 64,162.4 28,100 64,37.6 136,37.6" />
        </g>
        <g className="hm-spin-rev">
          <polygon className="hm-hex hm-hex-inner" points="140,100 120,134.6 80,134.6 60,100 80,65.4 120,65.4" />
        </g>
        <circle className="hm-ring" cx="100" cy="100" r="30" />
        <circle className="hm-pulse" cx="100" cy="100" r="12" />
        <circle className="hm-core" cx="100" cy="100" r="12" />
      </svg>
    </div>
  );
}
