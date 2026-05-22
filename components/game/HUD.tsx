"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function HUD() {
  const boost = useGameStore((state) => state.boost);
  const ballCam = useGameStore((state) => state.ballCam);
  const gamepad = useGameStore((state) => state.gamepad);
  const score = useGameStore((state) => state.score);
  const speed = useGameStore((state) => state.speed);
  const started = useGameStore((state) => state.started);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const startGame = useGameStore((state) => state.startGame);
  const resetMatch = useGameStore((state) => state.resetMatch);

  const boostWidth = useMemo(() => `${Math.round(boost)}%`, [boost]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 text-white sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-white/15 bg-black/35 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.22em] text-sky-200/80">Score</div>
          <div className="mt-1 flex items-center gap-3 text-3xl font-bold tabular-nums">
            <span className="text-sky-300">{score.blue}</span>
            <span className="text-white/35">-</span>
            <span className="text-orange-300">{score.orange}</span>
          </div>
        </div>

        <div className="rounded-lg border border-white/15 bg-black/35 px-4 py-3 text-right shadow-2xl backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.22em] text-white/55">Time</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{formatTime(timeRemaining)}</div>
        </div>
      </div>

      {!started ? (
        <div className="pointer-events-auto mx-auto mb-8 flex w-full max-w-md flex-col items-center rounded-lg border border-white/15 bg-black/45 p-5 text-center shadow-2xl backdrop-blur-md">
          <div className="text-sm uppercase tracking-[0.28em] text-sky-200">Arcade Arena</div>
          <h1 className="mt-2 text-4xl font-bold tracking-normal">Rocket Arena</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Keyboard: W/A/S/D یا جهت‌دارها. PS5: left stick, R2, L2, X, Circle, Triangle.
          </p>
          <button
            className="mt-5 rounded-md bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
            type="button"
            onClick={startGame}
          >
            Start Match
          </button>
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-3">
        <div className="rounded-lg border border-white/15 bg-black/35 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.22em] text-white/55">Speed</div>
          <div className="mt-1 text-4xl font-bold tabular-nums">
            {speed}
            <span className="ml-1 text-sm font-medium text-white/50">km/h</span>
          </div>
        </div>

        <div className="w-44 rounded-lg border border-white/15 bg-black/35 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/55">
            <span>Boost</span>
            <span>{Math.round(boost)}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-sky-300" style={{ width: boostWidth }} />
          </div>
        </div>

        <div className="rounded-lg border border-white/15 bg-black/35 px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md">
          <span className={ballCam ? "text-sky-300" : "text-white/45"}>BALL CAM</span>
          <span className="ml-2 text-white/40">E / △</span>
        </div>

        <div className="hidden rounded-lg border border-white/15 bg-black/35 px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md sm:block">
          <span className={gamepad.connected ? "text-emerald-300" : "text-white/45"}>
            {gamepad.connected ? "CONTROLLER" : "KEYBOARD"}
          </span>
        </div>

        <button
          className="pointer-events-auto rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          type="button"
          onClick={resetMatch}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
