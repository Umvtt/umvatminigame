import { useEffect, useRef, useState } from "react";

/** Full-page drafting overlay: edge rulers, crosshair + coordinate readout, click "pings". */
export default function Crosshair() {
  const root = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let n = 0;
    const move = (e: PointerEvent) => {
      const r = root.current;
      if (!r) return;
      r.classList.add("on");
      r.style.setProperty("--x", `${e.clientX}px`);
      r.style.setProperty("--y", `${e.clientY}px`);
      if (tag.current) {
        tag.current.textContent = `X ${String(Math.round(e.clientX)).padStart(4, "0")}  Y ${String(Math.round(e.clientY)).padStart(4, "0")}`;
      }
      // parallax the drafting grid a hair
      document.documentElement.style.setProperty("--gx", `${(e.clientX - innerWidth / 2) * -0.015}px`);
      document.documentElement.style.setProperty("--gy", `${(e.clientY - innerHeight / 2) * -0.015}px`);
    };
    const leave = () => root.current?.classList.remove("on");
    const down = (e: PointerEvent) => {
      const id = ++n;
      setPings((p) => [...p, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setPings((p) => p.filter((q) => q.id !== id)), 900);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={root} className="xh" aria-hidden>
      <div className="rule rule-x" />
      <div className="rule rule-y" />
      <div className="xh-v" />
      <div className="xh-h" />
      <div ref={tag} className="xh-tag" />
      {pings.map((p) => (
        <span key={p.id} className="ping" style={{ left: p.x, top: p.y }} />
      ))}
    </div>
  );
}
