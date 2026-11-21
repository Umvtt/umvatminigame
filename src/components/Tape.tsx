const TEXT = "NEW DOODADS INCOMING ✕ HANDLE WITH CARE ✕ NO REFUNDS, IT'S FREE ✕ PATENT PENDING ✕ ";

/** Hazard-tape marquee. */
export default function Tape() {
  return (
    <div className="tape" aria-hidden>
      <div className="tape-track">
        <span>{TEXT.repeat(4)}</span>
        <span>{TEXT.repeat(4)}</span>
      </div>
    </div>
  );
}
