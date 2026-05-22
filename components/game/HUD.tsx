"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HUD() {
  const boost = useGameStore((s) => s.boost);
  const ballCam = useGameStore((s) => s.ballCam);
  const gamepad = useGameStore((s) => s.gamepad);
  const score = useGameStore((s) => s.score);
  const speed = useGameStore((s) => s.speed);
  const started = useGameStore((s) => s.started);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const startGame = useGameStore((s) => s.startGame);
  const resetMatch = useGameStore((s) => s.resetMatch);

  const boostPct = useMemo(() => `${Math.round(boost)}%`, [boost]);
  const boostLow = boost < 25;
  const speedHigh = speed > 280;
  const timerUrgent = timeRemaining < 30 && started;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 text-white sm:p-5">

      {/* ── TOP BAR ── */}
      <div className="flex items-start justify-between gap-3">
        {/* Score */}
        <div
          className="rounded-xl border border-white/10 bg-black/50 px-5 py-3 shadow-2xl backdrop-blur-lg"
          style={{ boxShadow: "0 0 24px rgba(14,165,233,0.15), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        >
          <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">Score</div>
          <div className="flex items-center gap-3">
            <span className="min-w-[1.6rem] text-center text-3xl font-black tabular-nums text-sky-300" style={{ textShadow: "0 0 18px #38bdf8" }}>
              {score.blue}
            </span>
            <span className="text-xl font-light text-white/25">—</span>
            <span className="min-w-[1.6rem] text-center text-3xl font-black tabular-nums text-orange-300" style={{ textShadow: "0 0 18px #fb923c" }}>
              {score.orange}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div
          className="rounded-xl border border-white/10 bg-black/50 px-5 py-3 text-center shadow-2xl backdrop-blur-lg"
          style={{ boxShadow: timerUrgent ? "0 0 28px rgba(239,68,68,0.35)" : "0 0 24px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        >
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">Time</div>
          <div
            className="text-3xl font-black tabular-nums"
            style={{ color: timerUrgent ? "#f87171" : "#f0faff", textShadow: timerUrgent ? "0 0 20px #ef4444" : "none" }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* ── START SCREEN ── */}
      {!started ? (
        <div className="pointer-events-auto mx-auto mb-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/65 p-7 text-center shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: "0 0 60px rgba(14,165,233,0.2), 0 0 120px rgba(14,165,233,0.06)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-sky-300/80">Arcade Arena</div>
          <h1 className="text-4xl font-black tracking-tight text-white" style={{ textShadow: "0 0 30px rgba(14,165,233,0.5)" }}>
            ROCKET ARENA
          </h1>
          <p className="text-sm leading-6 text-white/55">
            کیبورد: <span className="text-sky-300">W A S D</span> یا <span className="text-sky-300">↑ ↓ ← →</span>
            <br />
            پرش: <span className="text-sky-300">Space</span> &nbsp;·&nbsp; بوست: <span className="text-sky-300">Shift</span>
            <br />
            ریست ماشین: <span className="text-sky-300">R</span>
          </p>
          <button
            className="mt-1 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-black uppercase tracking-[0.15em] text-black shadow-lg transition-all hover:scale-105 hover:bg-sky-400 active:scale-95"
            style={{ boxShadow: "0 0 28px rgba(14,165,233,0.6)" }}
            type="button"
            onClick={startGame}
          >
            شروع بازی
          </button>
        </div>
      ) : null}

      {/* ── BOTTOM BAR ── */}
      <div className="flex items-end justify-between gap-3">
        {/* Speed */}
        <div
          className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 shadow-2xl backdrop-blur-lg"
          style={{ boxShadow: speedHigh ? "0 0 28px rgba(249,115,22,0.4)" : "0 0 18px rgba(14,165,233,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">Speed</div>
          <div
            className="text-4xl font-black tabular-nums leading-none"
            style={{ color: speedHigh ? "#fdba74" : "#f0faff", textShadow: speedHigh ? "0 0 18px #f97316" : "none" }}
          >
            {speed}
            <span className="ml-1 text-sm font-medium text-white/40">km/h</span>
          </div>
        </div>

        {/* Boost */}
        <div
          className="w-48 rounded-xl border border-white/10 bg-black/50 px-4 py-3 shadow-2xl backdrop-blur-lg"
          style={{ boxShadow: boostLow ? "0 0 22px rgba(239,68,68,0.25)" : "0 0 18px rgba(14,165,233,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            <span>Boost</span>
            <span style={{ color: boostLow ? "#f87171" : "inherit" }}>{Math.round(boost)}</span>
          </div>
          <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-white/8 ring-1 ring-white/10">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: boostPct,
                background: boostLow
                  ? "linear-gradient(90deg, #f87171, #fb923c)"
                  : "linear-gradient(90deg, #0ea5e9, #22d3ee, #f0faff)",
                boxShadow: boostLow
                  ? "0 0 10px #ef4444"
                  : "0 0 12px rgba(14,165,233,0.8)",
              }}
            />
          </div>
        </div>

        {/* Ball cam indicator */}
        <div className="hidden rounded-xl border border-white/10 bg-black/50 px-3.5 py-3 text-xs font-bold shadow-xl backdrop-blur-lg sm:block">
          <span
            className="uppercase tracking-[0.2em]"
            style={{ color: ballCam ? "#38bdf8" : "rgba(255,255,255,0.3)", textShadow: ballCam ? "0 0 12px #38bdf8" : "none" }}
          >
            BALL CAM
          </span>
          <span className="ml-2 text-white/30">E</span>
        </div>

        {/* Input mode */}
        <div className="hidden rounded-xl border border-white/10 bg-black/50 px-3.5 py-3 text-xs font-bold shadow-xl backdrop-blur-lg sm:block">
          <span style={{ color: gamepad.connected ? "#6ee7b7" : "rgba(255,255,255,0.35)", textShadow: gamepad.connected ? "0 0 10px #10b981" : "none" }}>
            {gamepad.connected ? "CONTROLLER" : "KEYBOARD"}
          </span>
        </div>

        {/* Reset */}
        <button
          className="pointer-events-auto rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70 shadow-xl backdrop-blur-lg transition-all hover:bg-white/15 hover:text-white active:scale-95"
          type="button"
          onClick={resetMatch}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
