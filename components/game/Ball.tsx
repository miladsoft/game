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

    if (!body) {
      return;
    }

    body.setTranslation(BALL_RESET.translation, true);
    body.setRotation(BALL_RESET.rotation, true);
    body.setLinvel(BALL_RESET.velocity, true);
    body.setAngvel(BALL_RESET.velocity, true);
  };

  useFrame(() => {
    const body = bodyRef.current;

    if (!body) {
      return;
    }

    const translation = body.translation();

    if (translation.y < BALL.resetHeight) {
      resetBall();
      return;
    }

    const halfLength = ARENA.length / 2;
    const goalHalf = ARENA.goalWidth / 2;

    if (translation.z < -halfLength && Math.abs(translation.x) < goalHalf && translation.y < ARENA.goalHeight + BALL.radius) {
      onGoal("orange");
      resetBall();
    }

    if (translation.z > halfLength && Math.abs(translation.x) < goalHalf && translation.y < ARENA.goalHeight + BALL.radius) {
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
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[BALL.radius, 32, 32]} />
        <meshStandardMaterial color="#f8fafc" emissive="#1e3a8a" emissiveIntensity={0.14} roughness={0.42} />
      </mesh>
    </RigidBody>
  );
}
