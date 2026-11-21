/** Liquid cursor trail. Positions are driven by fx/jelly.ts; this just renders the shapes + goo filters. */
const RADII = [13, 10, 8, 6, 4.5];

export default function GooCursor() {
  return (
    <svg className="goo" aria-hidden>
      <defs>
        <filter id="goo-filter" filterUnits="userSpaceOnUse" x="0" y="0" width="0" height="0" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
        <filter id="goo-soft" x="-20%" y="-50%" width="140%" height="300%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
      </defs>
      <g id="goo-group" filter="url(#goo-filter)" className="is-hidden">
        <rect id="goo-magnet" width="0" height="0" />
        {RADII.map((r, i) => (
          <circle key={i} id={`goo-drop-${i}`} r={r} cx="0" cy="0" transform="translate(-999 -999)" />
        ))}
      </g>
    </svg>
  );
}
