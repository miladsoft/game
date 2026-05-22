"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Controls from "./Controls";
import HUD from "./HUD";
import PhysicsWorld from "./PhysicsWorld";
import { CAMERA } from "@/lib/game/constants";

export default function GameCanvas() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <Controls />
      <HUD />
      <Canvas
        camera={{ fov: CAMERA.fov, near: 0.1, far: 220, position: [0, CAMERA.height, 14] }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#07111f"]} />
        <fog attach="fog" args={["#07111f", 42, 112]} />
        <Suspense fallback={null}>
          <PhysicsWorld />
        </Suspense>
      </Canvas>
    </main>
  );
}
