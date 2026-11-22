/** The Doodad mark: a fine hexagon with a single point at its centre. */
export default function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg className="mark" viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <polygon points="21,12 16.5,19.8 7.5,19.8 3,12 7.5,4.2 16.5,4.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" className="mark-dot" />
    </svg>
  );
}
