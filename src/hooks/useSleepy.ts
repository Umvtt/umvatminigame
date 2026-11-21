import { useSyncExternalStore } from "react";

export type Mood = "awake" | "drowsy" | "asleep" | "startled";

const DROWSY_MS = 15_000;
const ASLEEP_MS = 20_000;

let mood: Mood = "awake";
const subs = new Set<() => void>();
let t1 = 0, t2 = 0, t3 = 0;
let lastPing = 0;
let installed = false;

function set(next: Mood) {
  if (next === mood) return;
  mood = next;
  subs.forEach((f) => f());
}
function schedule() {
  window.clearTimeout(t1);
  window.clearTimeout(t2);
  t1 = window.setTimeout(() => set("drowsy"), DROWSY_MS);
  t2 = window.setTimeout(() => set("asleep"), ASLEEP_MS);
}
function activity() {
  const now = performance.now();
  if (now - lastPing < 150 && mood === "awake") return;
  lastPing = now;
  if (mood === "asleep") {
    set("startled");
    window.clearTimeout(t3);
    t3 = window.setTimeout(() => set("awake"), 900);
  } else if (mood === "drowsy") {
    set("awake");
  }
  schedule();
}
function install() {
  if (installed) return;
  installed = true;
  for (const ev of ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"]) {
    window.addEventListener(ev, activity, { passive: true });
  }
  schedule();
}

/** Shared idle state: the mascot gets drowsy, falls asleep, and is startled awake. */
export function useSleepy() {
  return useSyncExternalStore(
    (cb) => {
      install();
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => mood,
    () => "awake" as Mood,
  );
}
