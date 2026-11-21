import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const DURATION = 10;

/** Example minigame — copy this folder as a template for new games. */
export default function ClickSpeed() {
  const [best, setBest] = useLocalStorage("click-speed:best", 0);
  const [clicks, setClicks] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearInterval(timer.current);
  }, []);

  const start = () => {
    setClicks(1);
    setLeft(DURATION);
    setState("running");
    const end = Date.now() + DURATION * 1000;
    timer.current = window.setInterval(() => {
      const remaining = Math.max(0, (end - Date.now()) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer.current);
        setState("done");
      }
    }, 50);
  };

  useEffect(() => {
    if (state === "done" && clicks > best) setBest(clicks);
  }, [state, clicks, best, setBest]);

  const onClick = () => (state === "running" ? setClicks((c) => c + 1) : start());

  return (
    <div className="center">
      <div className="stats">
        <div><b>{clicks}</b><span>clicks</span></div>
        <div><b>{left.toFixed(1)}s</b><span>left</span></div>
        <div><b>{best}</b><span>best</span></div>
      </div>
      <button className="big-btn" onClick={onClick}>
        {state === "idle" && "Click to start"}
        {state === "running" && "CLICK!"}
        {state === "done" && `${(clicks / DURATION).toFixed(1)} CPS — again?`}
      </button>
    </div>
  );
}
