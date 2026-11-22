import { useEffect, useRef, useState } from "react";
import Roll from "../../components/Roll";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const DURATION = 10;
/** After the round ends, ignore clicks briefly so frantic clicking doesn't instantly restart and wipe the result. */
const COOLDOWN_MS = 1000;

/** Example game — copy this folder as a template for new games. */
export default function ClickSpeed() {
  const [best, setBest] = useLocalStorage("click-speed:best", 0);
  const [clicks, setClicks] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [locked, setLocked] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const cooldown = useRef<number | undefined>(undefined);
  const count = useRef(0);

  useEffect(() => {
    return () => {
      window.clearInterval(timer.current);
      window.clearTimeout(cooldown.current);
    };
  }, []);

  const finish = () => {
    window.clearInterval(timer.current);
    setLeft(0);
    setState("done");
    const isBest = count.current > best;
    setNewBest(isBest);
    if (isBest) setBest(count.current);
    setLocked(true);
    cooldown.current = window.setTimeout(() => setLocked(false), COOLDOWN_MS);
  };

  const start = () => {
    count.current = 1;
    setClicks(1);
    setLeft(DURATION);
    setState("running");
    setNewBest(false);
    const end = performance.now() + DURATION * 1000;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const remaining = Math.max(0, (end - performance.now()) / 1000);
      if (remaining <= 0) finish();
      else setLeft(remaining);
    }, 50);
  };

  const onClick = () => {
    if (locked) return;
    if (state === "running") {
      count.current += 1;
      setClicks(count.current);
    } else {
      start();
    }
  };

  const hint =
    state === "idle" ? "The timer starts on your first click." :
    state === "running" ? "Keep going." :
    locked ? "Recording result…" : "Click again to start a new round.";

  return (
    <div className="cs">
      <dl className="cs-stats">
        <div><dt className="mono">Clicks</dt><dd><Roll value={clicks} /></dd></div>
        <div className={state === "running" && left < 3 ? "is-urgent" : ""}><dt className="mono">Time</dt><dd className="tabular">{left.toFixed(1)}</dd></div>
        <div><dt className="mono">Best {newBest && <em>New</em>}</dt><dd><Roll value={best} /></dd></div>
      </dl>
      <button
        className={`cs-pad is-${state}`}
        onClick={onClick}
        // Holding Enter auto-repeats clicks; only count real presses.
        onKeyDown={(e) => e.repeat && e.preventDefault()}
        disabled={locked}
      >
        <span key={state} className="cs-label">
          {state === "idle" && "Click to begin"}
          {state === "running" && "Click"}
          {state === "done" && <>{(clicks / DURATION).toFixed(1)} <small>clicks per second</small></>}
        </span>
      </button>
      <div className="cs-bar" aria-hidden><i style={{ transform: `scaleX(${left / DURATION})` }} /></div>
      <p className="cs-hint mono">{hint}</p>
    </div>
  );
}
