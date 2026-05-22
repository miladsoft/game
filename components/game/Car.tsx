"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Quaternion, Vector3 } from "three";
import { CAR } from "@/lib/game/constants";
import { CAR_PHYSICS, CAR_RESET } from "@/lib/game/physics";
import { useGameStore } from "@/stores/game-store";

const forwardVector = new Vector3();
const rightVector = new Vector3();
const rotationQuaternion = new Quaternion();

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function moveTowards(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}

type CarProps = {
  bodyRef: RefObject<RapierRigidBody | null>;
};

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, -0.26, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.32, 24]} />
        <meshStandardMaterial color="#050816" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#94a3b8" emissive="#0f172a" emissiveIntensity={0.2} roughness={0.35} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#94a3b8" emissive="#0f172a" emissiveIntensity={0.2} roughness={0.35} metalness={0.65} />
      </mesh>
    </group>
  );
}

export default function Car({ bodyRef }: CarProps) {
  const jumpLockedRef = useRef(false);
  const resetLockedRef = useRef(false);
  const yawRef = useRef(0);
  const boostVisible = useGameStore((state) => state.controls.boost || state.gamepad.boost);

  const resetCar = () => {
    const body = bodyRef.current;

    if (!body) {
      return;
    }

    body.setTranslation(CAR_RESET.translation, true);
    body.setRotation(CAR_RESET.rotation, true);
    body.setLinvel(CAR_RESET.velocity, true);
    body.setAngvel(CAR_RESET.velocity, true);
    yawRef.current = 0;
  };

  useFrame((_, delta) => {
    const body = bodyRef.current;

    if (!body) {
      return;
    }

    const store = useGameStore.getState();
    const { controls, gamepad, started } = store;

    if (!started) {
      body.setLinvel(CAR_RESET.velocity, true);
      body.setAngvel(CAR_RESET.velocity, true);
      return;
    }

    const translation = body.translation();
    const velocity = body.linvel();
    const speed = Math.hypot(velocity.x, velocity.z);
    const grounded = translation.y < 1.35;

    store.setSpeed(Math.round(speed * 12));

    const keyboardThrottle = Number(controls.accelerate) - Number(controls.brake);
    const keyboardSteer = Number(controls.left) - Number(controls.right);
    const throttle = clamp(keyboardThrottle + gamepad.throttle, -1, 1);
    const steerInput = clamp(keyboardSteer + gamepad.steer, -1, 1);

    forwardVector.set(Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)).normalize();
    rightVector.set(Math.cos(yawRef.current), 0, Math.sin(yawRef.current)).normalize();

    const forwardSpeed = velocity.x * forwardVector.x + velocity.z * forwardVector.z;
    const lateralSpeed = velocity.x * rightVector.x + velocity.z * rightVector.z;
    const reverseFactor = forwardSpeed < -1 ? -1 : 1;
    const steerSpeedFactor = clamp(Math.abs(forwardSpeed) / CAR.maxForwardSpeed, 0.22, 1);

    if (steerInput !== 0 && (Math.abs(throttle) > 0 || speed > 0.35)) {
      yawRef.current += steerInput * reverseFactor * CAR.steerSpeed * steerSpeedFactor * delta;
    }

    rotationQuaternion.setFromAxisAngle(new Vector3(0, 1, 0), yawRef.current);
    body.setRotation(rotationQuaternion, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    forwardVector.set(Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)).normalize();
    rightVector.set(Math.cos(yawRef.current), 0, Math.sin(yawRef.current)).normalize();

    const targetForwardSpeed =
      throttle > 0
        ? CAR.maxForwardSpeed * throttle
        : throttle < 0
          ? CAR.maxReverseSpeed * throttle
          : 0;
    const acceleration = throttle > 0 ? CAR.acceleration : throttle < 0 ? CAR.reverseAcceleration : CAR.coastDrag;
    const nextForwardSpeed = moveTowards(forwardSpeed, targetForwardSpeed, acceleration * delta);
    const nextLateralSpeed = moveTowards(
      lateralSpeed,
      0,
      CAR.lateralGrip * delta * clamp(speed / 8, 1, 3.2),
    );

    if (grounded) {
      body.setLinvel(
        {
          x: forwardVector.x * nextForwardSpeed + rightVector.x * nextLateralSpeed,
          y: velocity.y,
          z: forwardVector.z * nextForwardSpeed + rightVector.z * nextLateralSpeed,
        },
        true,
      );
    }

    const jumpPressed = controls.jump || gamepad.jump;
    const boostPressed = controls.boost || gamepad.boost;
    const resetPressed = controls.reset || gamepad.reset;

    if (jumpPressed && grounded && !jumpLockedRef.current) {
      body.applyImpulse({ x: 0, y: CAR.jumpImpulse, z: 0 }, true);
      jumpLockedRef.current = true;
    }

    if (!jumpPressed) {
      jumpLockedRef.current = false;
    }

    const nextBoost = boostPressed
      ? store.boost - CAR.boostDrainPerSecond * delta
      : store.boost + CAR.boostRecoverPerSecond * delta;

    store.setBoost(nextBoost);

    if (boostPressed && store.boost > 1) {
      const boostedSpeed = Math.min(CAR.maxForwardSpeed * 1.55, speed + CAR.boostImpulse);
      body.setLinvel(
        {
          x: forwardVector.x * boostedSpeed,
          y: velocity.y,
          z: forwardVector.z * boostedSpeed,
        },
        true,
      );
    }

    if (resetPressed && !resetLockedRef.current) {
      resetCar();
      resetLockedRef.current = true;
    }

    if (!resetPressed) {
      resetLockedRef.current = false;
    }

    if (translation.y < CAR.resetHeight) {
      resetCar();
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      angularDamping={CAR_PHYSICS.angularDamping}
      colliders={CAR_PHYSICS.colliders}
      friction={CAR_PHYSICS.friction}
      linearDamping={CAR_PHYSICS.linearDamping}
      mass={CAR_PHYSICS.mass}
      position={CAR.spawn}
      restitution={CAR_PHYSICS.restitution}
      canSleep={false}
    >
      <group>
        <mesh castShadow receiveShadow position={[0, 0.04, 0.18]}>
          <boxGeometry args={[2.15, 0.42, 2.9]} />
          <meshStandardMaterial color="#08c7e8" emissive="#0369a1" emissiveIntensity={0.12} roughness={0.43} metalness={0.32} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.18, -1.28]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[1.9, 0.32, 0.92]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.16} roughness={0.4} metalness={0.35} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.45, -0.42]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[1.2, 0.52, 1.05]} />
          <meshStandardMaterial color="#0f172a" emissive="#082f49" emissiveIntensity={0.22} roughness={0.28} metalness={0.18} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.8, 0.18]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.9, 0.2, 0.95]} />
          <meshStandardMaterial color="#0b1120" emissive="#0ea5e9" emissiveIntensity={0.12} roughness={0.24} metalness={0.25} />
        </mesh>

        <mesh castShadow receiveShadow position={[-1.05, 0.28, -1.04]}>
          <boxGeometry args={[0.32, 0.38, 0.94]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.42} metalness={0.3} />
        </mesh>
        <mesh castShadow receiveShadow position={[1.05, 0.28, -1.04]}>
          <boxGeometry args={[0.32, 0.38, 0.94]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.42} metalness={0.3} />
        </mesh>
        <mesh castShadow receiveShadow position={[-1.05, 0.24, 1.05]}>
          <boxGeometry args={[0.36, 0.42, 1.05]} />
          <meshStandardMaterial color="#0891b2" roughness={0.42} metalness={0.3} />
        </mesh>
        <mesh castShadow receiveShadow position={[1.05, 0.24, 1.05]}>
          <boxGeometry args={[0.36, 0.42, 1.05]} />
          <meshStandardMaterial color="#0891b2" roughness={0.42} metalness={0.3} />
        </mesh>

        <mesh position={[0, 0.14, -1.64]}>
          <boxGeometry args={[1.45, 0.1, 0.12]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>

        <mesh castShadow position={[0, 0.72, 1.42]}>
          <boxGeometry args={[2.05, 0.12, 0.34]} />
          <meshStandardMaterial color="#0284c7" emissive="#0ea5e9" emissiveIntensity={0.25} roughness={0.38} metalness={0.35} />
        </mesh>
        <mesh castShadow position={[-0.78, 0.55, 1.28]} rotation={[0.16, 0, 0]}>
          <boxGeometry args={[0.12, 0.55, 0.14]} />
          <meshStandardMaterial color="#0f172a" roughness={0.42} metalness={0.32} />
        </mesh>
        <mesh castShadow position={[0.78, 0.55, 1.28]} rotation={[0.16, 0, 0]}>
          <boxGeometry args={[0.12, 0.55, 0.14]} />
          <meshStandardMaterial color="#0f172a" roughness={0.42} metalness={0.32} />
        </mesh>

        <mesh castShadow position={[-0.34, 0.14, 1.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.34, 18]} />
          <meshStandardMaterial color="#111827" emissive="#fb923c" emissiveIntensity={0.18} roughness={0.32} metalness={0.6} />
        </mesh>
        <mesh castShadow position={[0.34, 0.14, 1.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.34, 18]} />
          <meshStandardMaterial color="#111827" emissive="#fb923c" emissiveIntensity={0.18} roughness={0.32} metalness={0.6} />
        </mesh>

        {boostVisible ? (
          <group position={[0, 0.05, 2.02]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <coneGeometry args={[0.58, 1.75, 24]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.65} />
            </mesh>
            <mesh position={[0, 0, -0.15]}>
              <coneGeometry args={[0.32, 1.15, 20]} />
              <meshBasicMaterial color="#67e8f9" transparent opacity={0.9} />
            </mesh>
          </group>
        ) : null}

        <Wheel x={-1.08} z={-1.02} />
        <Wheel x={1.08} z={-1.02} />
        <Wheel x={-1.08} z={1.08} />
        <Wheel x={1.08} z={1.08} />
      </group>
    </RigidBody>
  );
}
