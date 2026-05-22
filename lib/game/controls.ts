import type { ControlKey } from "./types";

export const KEY_BINDINGS: Record<string, ControlKey> = {
  KeyW: "accelerate",
  w: "accelerate",
  W: "accelerate",
  ArrowUp: "accelerate",
  KeyS: "brake",
  s: "brake",
  S: "brake",
  ArrowDown: "brake",
  KeyA: "left",
  a: "left",
  A: "left",
  ArrowLeft: "left",
  KeyD: "right",
  d: "right",
  D: "right",
  ArrowRight: "right",
  KeyE: "ballCam",
  e: "ballCam",
  E: "ballCam",
  Space: "jump",
  " ": "jump",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  Shift: "boost",
  KeyR: "reset",
  r: "reset",
  R: "reset",
};

export function getControlFromKeyboardEvent(event: KeyboardEvent) {
  return KEY_BINDINGS[event.code] ?? KEY_BINDINGS[event.key];
}
