"use client";

import type { RefObject } from "react";
import { BallCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { ARENA, BALL } from "@/lib/game/constants";
import { BALL_PHYSICS, BALL_RESET } from "@/lib/game/physics";

type BallProps = {
  bodyRef: RefObject<RapierRigidBody | null>;
  onGoal: (team: "blue" | "orange") => void;
};

export default function Ball({ bodyRef, onGoal }: BallProps) {
  const resetBall = () => {
    const body = bodyRef.current;
    if (!body) return;
    body.setTranslation(BALL_RESET.translation, true);
    body.setRotation(BALL_RESET.rotation, true);
    body.setLinvel(BALL_RESET.velocity, true);
    body.setAngvel(BALL_RESET.velocity, true);
  };

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    const translation = body.translation();

    if (translation.y < BALL.resetHeight) {
      resetBall();
      return;
    }

    const halfLength = ARENA.length / 2;
    const goalHalf = ARENA.goalWidth / 2;

    if (
      translation.z < -halfLength &&
      Math.abs(translation.x) < goalHalf &&
      translation.y < ARENA.goalHeight + BALL.radius
    ) {
      onGoal("orange");
      resetBall();
    }

    if (
      translation.z > halfLength &&
      Math.abs(translation.x) < goalHalf &&
      translation.y < ARENA.goalHeight + BALL.radius
    ) {
      onGoal("blue");
      resetBall();
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      angularDamping={BALL_PHYSICS.angularDamping}
      colliders={false}
      friction={BALL_PHYSICS.friction}
      linearDamping={BALL_PHYSICS.linearDamping}
      mass={BALL_PHYSICS.mass}
      position={BALL.spawn}
      restitution={BALL_PHYSICS.restitution}
    >
      <BallCollider args={[BALL.radius]} restitution={BALL_PHYSICS.restitution} />

      {/* Outer shell */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[BALL.radius, 48, 48]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          emissive="#38bdf8"
          emissiveIntensity={1.6}
          roughness={0.12}
          metalness={0.25}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* Inner emissive core (slightly smaller, very bright) */}
      <mesh>
        <sphereGeometry args={[BALL.radius * 0.72, 32, 32]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.18} />
      </mesh>

      {/* Ball light */}
      <pointLight color="#38bdf8" intensity={12} distance={8} decay={2} />
    </RigidBody>
  );
}
