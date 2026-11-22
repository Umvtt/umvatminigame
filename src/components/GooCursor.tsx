/**
 * The cursor on mouse devices: a jelly droplet with a little trail (the native cursor is hidden).
 * All positions are driven by fx/jelly.ts; this only renders the shapes and the goo filters.
 */
const TRAIL = [5, 4, 3.2, 2.6];

export default function GooCursor() {
  return (
    <svg className="goo" aria-hidden>
      <defs>
        <filter id="goo-filter" filterUnits="userSpaceOnUse" x="0" y="0" width="0" height="0" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feDropShadow in="goo" dx="0" dy="1.5" stdDeviation="1.3" floodColor="#1a1030" floodOpacity="0.35" />
        </filter>
        <filter id="goo-soft" x="-20%" y="-50%" width="140%" height="300%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
      </defs>
      <g id="goo-group" filter="url(#goo-filter)" className="is-hidden">
        <ellipse id="goo-neck" rx="0" ry="0" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={`s${i}`} id={`goo-splash-${i}`} r="0" />
        ))}
        {TRAIL.map((r, i) => (
          <circle key={i} id={`goo-drop-${i + 1}`} r={r} transform="translate(-999 -999)" />
        ))}
        <circle id="goo-lead" r="7" transform="translate(-999 -999)" />
      </g>
      <g id="goo-shine" className="is-hidden">
        <ellipse id="goo-gloss" rx="0" ry="0" transform="translate(-999 -999)" />
        <rect id="goo-bar" x="-1.4" y="0" width="2.8" height="0" rx="1.4" transform="translate(-999 -999)" />
      </g>
    </svg>
  );
}
