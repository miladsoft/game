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
      {/* Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.34, 28]} />
        <meshStandardMaterial color="#050810" roughness={0.88} metalness={0.05} />
      </mesh>
      {/* Outer rim */}
      <mesh position={[0, 0, 0.19]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 24]} />
        <meshStandardMaterial
          color="#8fb8d0"
          emissive="#0e3a5c"
          emissiveIntensity={0.4}
          roughness={0.22}
          metalness={0.82}
        />
      </mesh>
      {/* Inner rim */}
      <mesh position={[0, 0, -0.19]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 24]} />
        <meshStandardMaterial
          color="#8fb8d0"
          emissive="#0e3a5c"
          emissiveIntensity={0.4}
          roughness={0.22}
          metalness={0.82}
        />
      </mesh>
      {/* Rim spokes glow */}
      <mesh>
        <torusGeometry args={[0.18, 0.025, 8, 16]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.5}
        />
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
    if (!body) return;
    body.setTranslation(CAR_RESET.translation, true);
    body.setRotation(CAR_RESET.rotation, true);
    body.setLinvel(CAR_RESET.velocity, true);
    body.setAngvel(CAR_RESET.velocity, true);
    yawRef.current = 0;
  };

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

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

    if (steerInput !== 0) {
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
    if (!jumpPressed) jumpLockedRef.current = false;

    const nextBoost = boostPressed
      ? store.boost - CAR.boostDrainPerSecond * delta
      : store.boost + CAR.boostRecoverPerSecond * delta;
    store.setBoost(nextBoost);

    if (boostPressed && store.boost > 1) {
      const boostedSpeed = Math.min(CAR.maxForwardSpeed * 1.6, speed + CAR.boostImpulse);
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
    if (!resetPressed) resetLockedRef.current = false;

    if (translation.y < CAR.resetHeight) resetCar();
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
        {/* ── Main body ── */}
        <mesh castShadow receiveShadow position={[0, 0.06, 0.14]}>
          <boxGeometry args={[2.18, 0.44, 2.95]} />
          <meshPhysicalMaterial
            color="#0b1e2e"
            emissive="#0369a1"
            emissiveIntensity={0.18}
            roughness={0.28}
            metalness={0.72}
            clearcoat={0.85}
            clearcoatRoughness={0.12}
          />
        </mesh>

        {/* Rear lower spoiler section */}
        <mesh castShadow receiveShadow position={[0, 0.2, -1.32]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[1.95, 0.28, 0.98]} />
          <meshPhysicalMaterial
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={1.2}
            roughness={0.22}
            metalness={0.6}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Cockpit / windshield frame */}
        <mesh castShadow receiveShadow position={[0, 0.48, -0.38]} rotation={[0.06, 0, 0]}>
          <boxGeometry args={[1.22, 0.54, 1.08]} />
          <meshPhysicalMaterial
            color="#040d18"
            emissive="#082f49"
            emissiveIntensity={0.4}
            roughness={0.15}
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transmission={0.35}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Roof */}
        <mesh castShadow receiveShadow position={[0, 0.84, 0.16]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.95, 0.18, 0.98]} />
          <meshPhysicalMaterial
            color="#050e1a"
            emissive="#0ea5e9"
            emissiveIntensity={0.22}
            roughness={0.18}
            metalness={0.3}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
          />
        </mesh>

        {/* Side skirts */}
        {([-1, 1] as const).map((side) => (
          <mesh key={side} castShadow receiveShadow position={[side * 1.07, 0.26, -1.06]}>
            <boxGeometry args={[0.3, 0.4, 0.96]} />
            <meshPhysicalMaterial
              color="#0ea5e9"
              emissive="#0ea5e9"
              emissiveIntensity={0.9}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        ))}
        {([-1, 1] as const).map((side) => (
          <mesh key={`front-${side}`} castShadow receiveShadow position={[side * 1.07, 0.22, 1.06]}>
            <boxGeometry args={[0.34, 0.44, 1.08]} />
            <meshPhysicalMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={0.8}
              roughness={0.32}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Front bumper grill */}
        <mesh castShadow position={[0, 0.04, 1.72]}>
          <boxGeometry args={[2.05, 0.32, 0.14]} />
          <meshStandardMaterial
            color="#040c16"
            emissive="#0ea5e9"
            emissiveIntensity={0.55}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>

        {/* Headlights — outer */}
        {([-1, 1] as const).map((side) => (
          <group key={`hl-${side}`} position={[side * 0.72, 0.26, 1.76]}>
            <mesh>
              <boxGeometry args={[0.48, 0.18, 0.08]} />
              <meshStandardMaterial
                color="#f0faff"
                emissive="#f0faff"
                emissiveIntensity={4.5}
                roughness={0.1}
                metalness={0.2}
              />
            </mesh>
            <pointLight color="#c8e8ff" intensity={8} distance={6} decay={2} />
          </group>
        ))}

        {/* Taillights */}
        <mesh position={[0, 0.18, -1.66]}>
          <boxGeometry args={[1.55, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#ff2020"
            emissive="#ff2020"
            emissiveIntensity={3.2}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Spoiler wing */}
        <mesh castShadow position={[0, 0.76, 1.44]}>
          <boxGeometry args={[2.1, 0.13, 0.38]} />
          <meshPhysicalMaterial
            color="#0284c7"
            emissive="#0ea5e9"
            emissiveIntensity={1.4}
            roughness={0.28}
            metalness={0.55}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {([-1, 1] as const).map((side) => (
          <mesh key={`wing-post-${side}`} castShadow position={[side * 0.8, 0.56, 1.3]} rotation={[0.14, 0, 0]}>
            <boxGeometry args={[0.1, 0.52, 0.13]} />
            <meshStandardMaterial color="#040c16" roughness={0.4} metalness={0.4} />
          </mesh>
        ))}

        {/* Exhaust pipes */}
        {([-0.36, 0.36] as const).map((x) => (
          <mesh key={x} castShadow position={[x, 0.14, 1.74]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.36, 20]} />
            <meshStandardMaterial
              color="#0e1520"
              emissive="#fb923c"
              emissiveIntensity={boostVisible ? 2.8 : 0.4}
              roughness={0.28}
              metalness={0.65}
            />
          </mesh>
        ))}

        {/* Boost flame */}
        {boostVisible ? (
          <group position={[0, 0.06, 2.08]} rotation={[Math.PI / 2, 0, 0]}>
            {/* Outer flame */}
            <mesh>
              <coneGeometry args={[0.72, 2.2, 28]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.55} />
            </mesh>
            {/* Mid flame */}
            <mesh position={[0, 0, -0.18]}>
              <coneGeometry args={[0.48, 1.7, 24]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.75} />
            </mesh>
            {/* Inner hot core */}
            <mesh position={[0, 0, -0.34]}>
              <coneGeometry args={[0.24, 1.2, 20]} />
              <meshBasicMaterial color="#67e8f9" transparent opacity={0.95} />
            </mesh>
            {/* White-hot tip */}
            <mesh position={[0, 0, -0.5]}>
              <coneGeometry args={[0.1, 0.6, 16]} />
              <meshBasicMaterial color="#f0faff" transparent opacity={1} />
            </mesh>
            <pointLight color="#fb923c" intensity={18} distance={5} decay={2} />
          </group>
        ) : null}

        {/* Underglow */}
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[2.0, 0.04, 2.7]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.35} />
        </mesh>

        {/* Wheels */}
        <Wheel x={-1.1} z={-1.04} />
        <Wheel x={1.1} z={-1.04} />
        <Wheel x={-1.1} z={1.1} />
        <Wheel x={1.1} z={1.1} />
      </group>
    </RigidBody>
  );
}
