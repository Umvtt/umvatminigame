import { useId } from "react";
import { useSleepy, type Mood } from "../hooks/useSleepy";

/**
 * The mascot: a little jelly with eyes that follow you.
 * Gets drowsy when you stop moving, falls asleep, and jumps when you come back.
 */
export default function Blobby({ size = 40, mood: forced, className = "" }: { size?: number; mood?: Mood | "lost"; className?: string }) {
  const live = useSleepy();
  const mood = forced ?? live;
  const id = useId().replace(/:/g, "");
  return (
    <span className={`blobby bb-${mood} ${className}`} style={{ width: size, height: size * 0.84 }} data-jelly aria-hidden>
      <svg viewBox="0 0 120 100">
        <defs>
          <radialGradient id={`bb-${id}`} cx="38%" cy="28%" r="80%">
            <stop offset="0" style={{ stopColor: "#fff", stopOpacity: 0.75 }} />
            <stop offset=".35" style={{ stopColor: "var(--mascot)" }} />
            <stop offset="1" style={{ stopColor: "var(--mascot-deep)" }} />
          </radialGradient>
        </defs>
        <ellipse className="bb-shadow" cx="60" cy="94" rx="40" ry="5" />
        <g className="bb-body">
          <path d="M14 88 C 8 58, 24 16, 60 15 C 96 16, 112 58, 106 88 Q 60 97, 14 88 Z" fill={`url(#bb-${id})`} />
          <ellipse cx="40" cy="33" rx="11" ry="5.5" transform="rotate(-24 40 33)" fill="#fff" opacity=".7" />
          <circle cx="54" cy="26" r="2.4" fill="#fff" opacity=".7" />
          <ellipse className="bb-cheek" cx="35" cy="66" rx="7" ry="4" />
          <ellipse className="bb-cheek" cx="85" cy="66" rx="7" ry="4" />
          <g className="bb-eyes" data-eyes>
            <g className="bb-eye">
              <ellipse cx="46" cy="53" rx="8" ry="9.5" fill="#fff" />
              <circle className="bb-pupil" cx="46" cy="54" r="4.5" />
            </g>
            <g className="bb-eye">
              <ellipse cx="74" cy="53" rx="8" ry="9.5" fill="#fff" />
              <circle className="bb-pupil" cx="74" cy="54" r="4.5" />
            </g>
          </g>
          <path className="bb-smile" d="M53 69 Q60 75 67 69" />
          <ellipse className="bb-yawn" cx="60" cy="71" rx="5" ry="6" />
          <ellipse className="bb-oh" cx="60" cy="71" rx="3" ry="3.5" />
        </g>
        <g className="bb-z">
          <text x="96" y="30">z</text>
          <text x="104" y="18">z</text>
          <text x="112" y="6">Z</text>
        </g>
      </svg>
    </span>
  );
}
