"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Controls from "./Controls";
import HUD from "./HUD";
import PhysicsWorld from "./PhysicsWorld";
import { CAMERA } from "@/lib/game/constants";

export default function GameCanvas() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <Controls />
      <HUD />
      <Canvas
        camera={{ fov: CAMERA.fov, near: 0.1, far: 260, position: [0, CAMERA.height, 14] }}
        dpr={[1, 1.8]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#04090f"]} />
        <fog attach="fog" args={["#04090f", 60, 145]} />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <PhysicsWorld />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={1.6}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.88}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </main>
  );
}
