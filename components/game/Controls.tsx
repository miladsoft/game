"use client";

import { useEffect, useRef } from "react";
import { getControlFromKeyboardEvent } from "@/lib/game/controls";
import { useGameStore } from "@/stores/game-store";

const GAMEPAD_DEADZONE = 0.14;

function deadzone(value: number) {
  if (Math.abs(value) < GAMEPAD_DEADZONE) {
    return 0;
  }

  return value;
}

function buttonValue(gamepad: Gamepad, index: number) {
  return gamepad.buttons[index]?.value ?? 0;
}

function buttonPressed(gamepad: Gamepad, index: number) {
  return Boolean(gamepad.buttons[index]?.pressed);
}

export default function Controls() {
  const previousBallCamButtonRef = useRef(false);
  const previousStartButtonRef = useRef(false);

  useEffect(() => {
    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      const control = getControlFromKeyboardEvent(event);

      if (!control) {
        return;
      }

      event.preventDefault();

      if (control === "ballCam" && pressed && !event.repeat) {
        useGameStore.getState().toggleBallCam();
        return;
      }

      useGameStore.getState().setControl(control, pressed);
    };

    const handleKeyDown = (event: KeyboardEvent) => setKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => setKey(event, false);

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("keyup", handleKeyUp, { capture: true });
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const pollGamepad = () => {
      const gamepad = navigator.getGamepads().find((pad) => pad?.connected);
      const store = useGameStore.getState();

      if (!gamepad) {
        store.setGamepadInput({
          connected: false,
          id: "",
          throttle: 0,
          steer: 0,
          jump: false,
          boost: false,
          reset: false,
        });
        animationFrame = requestAnimationFrame(pollGamepad);
        return;
      }

      const steerAxis = deadzone(gamepad.axes[0] ?? 0);
      const dpadLeft = buttonPressed(gamepad, 14);
      const dpadRight = buttonPressed(gamepad, 15);
      const dpadUp = buttonPressed(gamepad, 12);
      const dpadDown = buttonPressed(gamepad, 13);
      const cross = buttonPressed(gamepad, 0);
      const circle = buttonPressed(gamepad, 1);
      const triangle = buttonPressed(gamepad, 3);
      const options = buttonPressed(gamepad, 9);
      const accelerate = Math.max(buttonValue(gamepad, 7), dpadUp ? 1 : 0);
      const brake = Math.max(buttonValue(gamepad, 6), dpadDown ? 1 : 0);
      const steer = dpadLeft ? 1 : dpadRight ? -1 : -steerAxis;

      if (triangle && !previousBallCamButtonRef.current) {
        store.toggleBallCam();
      }

      if (cross && !previousStartButtonRef.current && !store.started) {
        store.startGame();
      }

      previousBallCamButtonRef.current = triangle;
      previousStartButtonRef.current = cross;

      store.setGamepadInput({
        connected: true,
        id: gamepad.id,
        throttle: accelerate - brake,
        steer,
        jump: cross,
        boost: circle,
        reset: options,
      });

      animationFrame = requestAnimationFrame(pollGamepad);
    };

    animationFrame = requestAnimationFrame(pollGamepad);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return null;
}
