export type SmartMascotState =
  | "hidden"
  | "entering"
  | "introWink"
  | "idle"
  | "watching"
  | "fastSwipe"
  | "returning"
  | "waving"
  | "reacting"
  | "peeking"
  | "leaving";

export type MascotDirection = "left" | "right" | "center";

export const INTRO_KEY = "cakepoprush-mascot-intro-shown";
