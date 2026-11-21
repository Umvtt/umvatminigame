import { useEffect, useRef, useState, type MouseEvent } from "react";
import Roll from "../../components/Roll";
import { poke, reducedMotion } from "../../fx/jelly";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const DURATION = 10;
/** After the round ends, ignore clicks briefly so frantic clicking doesn't instantly restart and wipe the result. */
const COOLDOWN_MS = 1000;

/** Spawn a short-lived element inside `host`; it removes itself when its animation ends. */
function spawn(host: HTMLElement, className: string, style: Record<string, string>, text = "") {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  for (const [k, v] of Object.entries(style)) el.style.setProperty(k, v);
  host.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

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
  const fx = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      window.clearInterval(timer.current);
      window.clearTimeout(cooldown.current);
    };
  }, []);

  const confetti = (big: boolean) => {
    const host = fx.current;
    if (!host || reducedMotion()) return;
    const n = big ? 42 : 22;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const d = 120 + Math.random() * (big ? 220 : 140);
      spawn(host, `confetti c${i % 4}`, {
        "--dx": `${Math.cos(a) * d}px`,
        "--dy": `${Math.sin(a) * d - 60}px`,
        "--r": `${Math.random() * 720 - 360}deg`,
        "--t": `${0.9 + Math.random() * 0.6}s`,
      });
    }
  };

  const finish = () => {
    window.clearInterval(timer.current);
    setLeft(0);
    setState("done");
    const isBest = count.current > best;
    setNewBest(isBest);
    if (isBest) setBest(count.current);
    confetti(isBest);
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

  const pop = (e: MouseEvent<HTMLButtonElement>) => {
    const host = fx.current;
    const b = btn.current;
    if (!host || !b || reducedMotion()) return;
    const hr = host.getBoundingClientRect();
    // Keyboard clicks have no pointer position: use the button centre.
    const br = b.getBoundingClientRect();
    const x = e.detail ? e.clientX : br.left + br.width / 2;
    const y = e.detail ? e.clientY : br.top + br.height / 2;
    spawn(host, "plus-one", {
      left: `${x - hr.left}px`,
      top: `${y - hr.top}px`,
      "--drift": `${Math.random() * 60 - 30}px`,
      "--rot": `${Math.random() * 30 - 15}deg`,
    }, "+1");
    // Pointer presses are squished by the jelly engine; keyboard presses need a manual poke.
    if (!e.detail) poke(b, 0.08);
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (locked) return;
    pop(e);
    if (state === "running") {
      count.current += 1;
      setClicks(count.current);
    } else {
      start();
    }
  };

  const urgent = state === "running" && left < 3;

  return (
    <div className="center">
      <div className="stats">
        <div><b><Roll value={clicks} /></b><span>pokes</span></div>
        <div className={urgent ? "is-urgent" : ""}><b className="tabular">{left.toFixed(1)}s</b><span>left</span></div>
        <div className={newBest ? "is-best" : ""}><b><Roll value={best} /></b><span>best</span></div>
      </div>
      <div className="btn-zone" ref={fx}>
        <button
          ref={btn}
          className={`big-btn is-${state}`}
          onClick={onClick}
          // Holding Enter auto-repeats clicks; only count real presses.
          onKeyDown={(e) => e.repeat && e.preventDefault()}
          disabled={locked}
          data-jelly
          data-goo
        >
          <span key={state} className="btn-label">
            {state === "idle" && "poke to start"}
            {state === "running" && "poke! poke!"}
            {state === "done" && (
              <>
                {(clicks / DURATION).toFixed(1)} pokes/sec
                <small>{locked ? "wobble wobble…" : newBest ? "new best! poke to go again" : "poke to go again"}</small>
              </>
            )}
          </span>
        </button>
        <div className="timebar" aria-hidden>
          <i style={{ transform: `scaleX(${left / DURATION})` }} className={urgent ? "is-urgent" : ""} />
        </div>
      </div>
    </div>
  );
}
