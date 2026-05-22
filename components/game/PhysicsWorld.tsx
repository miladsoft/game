"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Sparkles } from "@react-three/drei";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import Arena from "./Arena";
import Ball from "./Ball";
import CameraController from "./CameraController";
import Car from "./Car";
import Lights from "./Lights";
import { ARENA, CAR } from "@/lib/game/constants";
import { useGameStore } from "@/stores/game-store";

export default function PhysicsWorld() {
  const carRef = useRef<RapierRigidBody | null>(null);
  const ballRef = useRef<RapierRigidBody | null>(null);

  useFrame((_, delta) => {
    const store = useGameStore.getState();

    if (store.started && store.timeRemaining > 0) {
      store.tickTimer(delta);
    }
  });

  const handleGoal = (team: "blue" | "orange") => {
    useGameStore.getState().scoreGoal(team);

    const car = carRef.current;

    if (car) {
      car.setTranslation({ x: CAR.spawn[0], y: CAR.spawn[1], z: CAR.spawn[2] }, true);
      car.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      car.setLinvel({ x: 0, y: 0, z: 0 }, true);
      car.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  };

  return (
    <>
      <Lights />
      <Sparkles color="#7dd3fc" count={150} opacity={0.28} scale={[ARENA.width, 16, ARENA.backNetLength]} size={1.25} speed={0.22} />
      <Physics gravity={[0, -18, 0]} interpolate timeStep="vary">
        <Arena />
        <Car bodyRef={carRef} />
        <Ball bodyRef={ballRef} onGoal={handleGoal} />
      </Physics>
      <ContactShadows blur={2.6} far={24} opacity={0.3} position={[0, 0.04, 0]} scale={92} />
      <CameraController ballRef={ballRef} carRef={carRef} />
    </>
  );
}
