/** The sky behind everything: follows the time of day (sun, moon, stars), with slow jelly bubbles. */
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 37.3) % 100,
  y: (i * 61.7) % 70,
  s: 1 + ((i * 13) % 3) * 0.6,
  d: (i % 7) * 0.6,
}));
const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  x: 6 + ((i * 41) % 90),
  s: 14 + ((i * 17) % 40),
  t: 22 + ((i * 7) % 18),
  d: -((i * 5.3) % 30),
}));

export default function Sky() {
  return (
    <div className="sky" aria-hidden>
      <div className="stars">
        {STARS.map((s, i) => (
          <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
        ))}
      </div>
      <div className="sun" />
      <div className="bubbles">
        {BUBBLES.map((b, i) => (
          <i key={i} style={{ left: `${b.x}%`, width: b.s, height: b.s, animationDuration: `${b.t}s`, animationDelay: `${b.d}s` }} />
        ))}
      </div>
    </div>
  );
}
