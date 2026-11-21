import { vars } from "../util";

/** Text split into letters that drop in one by one. With `squishy`, each letter is its own jelly. */
export default function SplitText({ text, delay = 0, idle = false, squishy = false }: { text: string; delay?: number; idle?: boolean; squishy?: boolean }) {
  return (
    <span className={`split ${idle ? "split-idle" : ""}`} aria-label={text} role="text">
      {[...text].map((ch, i) => (
        <span
          key={i}
          className="split-ch"
          aria-hidden
          style={vars({ "--n": i, "--d0": `${delay}s` })}
          {...(squishy ? { "data-jelly": "", "data-inflate": "" } : {})}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
