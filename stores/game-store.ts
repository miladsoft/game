"use client";

import { create } from "zustand";
import { CAR, MATCH } from "@/lib/game/constants";
import type { ControlKey, ControlState, GamepadInput, Score } from "@/lib/game/types";

const DEFAULT_CONTROLS: ControlState = {
  accelerate: false,
  brake: false,
  left: false,
  right: false,
  jump: false,
  boost: false,
  reset: false,
  ballCam: false,
};

const DEFAULT_GAMEPAD: GamepadInput = {
  connected: false,
  id: "",
  throttle: 0,
  steer: 0,
  jump: false,
  boost: false,
  reset: false,
};

type GameStore = {
  started: boolean;
  controls: ControlState;
  gamepad: GamepadInput;
  ballCam: boolean;
  boost: number;
  speed: number;
  score: Score;
  timeRemaining: number;
  startGame: () => void;
  resetMatch: () => void;
  setControl: (key: ControlKey, pressed: boolean) => void;
  setGamepadInput: (input: GamepadInput) => void;
  toggleBallCam: () => void;
  setBoost: (boost: number) => void;
  setSpeed: (speed: number) => void;
  scoreGoal: (team: keyof Score) => void;
  tickTimer: (delta: number) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  started: false,
  controls: DEFAULT_CONTROLS,
  gamepad: DEFAULT_GAMEPAD,
  ballCam: true,
  boost: CAR.maxBoost,
  speed: 0,
  score: { blue: 0, orange: 0 },
  timeRemaining: MATCH.durationSeconds,
  startGame: () => set({ started: true }),
  resetMatch: () =>
    set({
      started: false,
      controls: DEFAULT_CONTROLS,
      gamepad: DEFAULT_GAMEPAD,
      ballCam: true,
      boost: CAR.maxBoost,
      speed: 0,
      score: { blue: 0, orange: 0 },
      timeRemaining: MATCH.durationSeconds,
    }),
  setControl: (key, pressed) =>
    set((state) => ({
      controls: { ...state.controls, [key]: pressed },
    })),
  setGamepadInput: (input) => set({ gamepad: input }),
  toggleBallCam: () => set((state) => ({ ballCam: !state.ballCam })),
  setBoost: (boost) => set({ boost: Math.max(0, Math.min(CAR.maxBoost, boost)) }),
  setSpeed: (speed) => set({ speed }),
  scoreGoal: (team) =>
    set((state) => ({
      score: { ...state.score, [team]: state.score[team] + 1 },
    })),
  tickTimer: (delta) =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - delta),
    })),
}));
