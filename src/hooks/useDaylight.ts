import { useEffect, useState } from "react";
import { PHASES, phaseFor, type Phase } from "../fx/daylight";

/** Follows the visitor's local time (or ?time=night etc). `cycle()` lets them flip through phases. */
export function useDaylight() {
  const [override, setOverride] = useState<Phase | null>(() => {
    const q = new URLSearchParams(window.location.search).get("time");
    return PHASES.includes(q as Phase) ? (q as Phase) : null;
  });
  const [clock, setClock] = useState(phaseFor);
  useEffect(() => {
    const id = window.setInterval(() => setClock(phaseFor()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const phase = override ?? clock;
  useEffect(() => {
    document.documentElement.dataset.time = phase;
  }, [phase]);
  const cycle = () => setOverride(PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length]);
  return { phase, cycle, isLive: override === null };
}
