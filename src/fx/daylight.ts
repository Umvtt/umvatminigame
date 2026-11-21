export type Phase = "morning" | "day" | "evening" | "night";
export const PHASES: Phase[] = ["morning", "day", "evening", "night"];

export function phaseFor(d = new Date()): Phase {
  const h = d.getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export const GREETING: Record<Phase, string> = {
  morning: "good morning",
  day: "good afternoon",
  evening: "good evening",
  night: "up late?",
};
