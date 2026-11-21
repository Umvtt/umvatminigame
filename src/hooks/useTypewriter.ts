import { useEffect, useState } from "react";
import { reducedMotion } from "../fx/jelly";

/** Types and deletes each phrase in turn. Pauses (showing the first phrase) when inactive. */
export function useTypewriter(phrases: string[], active: boolean) {
  const [text, setText] = useState(phrases[0]);
  useEffect(() => {
    if (!active || reducedMotion()) {
      setText(phrases[0]);
      return;
    }
    let i = 0;
    let len = phrases[0].length;
    let deleting = true;
    let id: number;
    const tick = () => {
      if (deleting) {
        len -= 1;
        if (len <= 0) {
          deleting = false;
          i = (i + 1) % phrases.length;
          len = 0;
        }
      } else {
        len += 1;
      }
      const current = phrases[i];
      setText(current.slice(0, Math.max(0, len)) || "​");
      let wait = deleting ? 35 : 70;
      if (!deleting && len >= current.length) {
        deleting = true;
        wait = 2200;
      }
      id = window.setTimeout(tick, wait);
    };
    id = window.setTimeout(tick, 2600);
    return () => window.clearTimeout(id);
  }, [active, phrases]);
  return text;
}
