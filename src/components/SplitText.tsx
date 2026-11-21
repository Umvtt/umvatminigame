import { vars } from "../util";

/** Text split into letters that rise in one by one, then do a gentle idle wave. */
export default function SplitText({ text, delay = 0, idle = false }: { text: string; delay?: number; idle?: boolean }) {
  return (
    <span className={`split ${idle ? "split-idle" : ""}`} aria-label={text} role="text">
      {[...text].map((ch, i) => (
        <span key={i} className="split-ch" aria-hidden style={vars({ "--n": i, "--d0": `${delay}s` })}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
