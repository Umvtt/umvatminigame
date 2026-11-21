import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const DURATION = 10;
/** After the round ends, ignore clicks briefly so frantic clicking doesn't instantly restart and wipe the result. */
const COOLDOWN_MS = 1000;

/** Example minigame — copy this folder as a template for new games. */
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

  return (
    <div className="center">
      <div className="stats">
        <div><b>{clicks}</b><span>Clicks</span></div>
        <div><b>{left.toFixed(1)}s</b><span>Time left</span></div>
        <div><b>{best}</b><span>Best</span></div>
      </div>
      <button
        className={`big-btn ${state === "running" ? "is-running" : ""}`}
        onClick={onClick}
        // Holding Enter auto-repeats clicks; only count real presses.
        onKeyDown={(e) => e.repeat && e.preventDefault()}
        disabled={locked}
      >
        {state === "idle" && "Click to start"}
        {state === "running" && "Click!"}
        {state === "done" && (
          <>
            {(clicks / DURATION).toFixed(1)} clicks/sec
            <small>{locked ? "Nice!" : newBest ? "New best! Click to play again" : "Click to play again"}</small>
          </>
        )}
      </button>
    </div>
  );
}
