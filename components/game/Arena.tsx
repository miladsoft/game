"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { ARENA } from "@/lib/game/constants";

function TeamGlow({ side }: { side: number }) {
  return (
    <meshStandardMaterial
      color={side < 0 ? "#0c2d4a" : "#4a1c0c"}
      emissive={side < 0 ? "#0ea5e9" : "#f97316"}
      emissiveIntensity={2.8}
      roughness={0.18}
      metalness={0.45}
    />
  );
}

function WallMaterial({ side }: { side?: number }) {
  if (side !== undefined) {
    return (
      <meshStandardMaterial
        color={side < 0 ? "#061828" : "#28100a"}
        emissive={side < 0 ? "#0369a1" : "#c2410c"}
        emissiveIntensity={0.55}
        roughness={0.5}
        metalness={0.3}
      />
    );
  }
  return (
    <meshStandardMaterial
      color="#060e18"
      emissive="#0d2235"
      emissiveIntensity={0.35}
      roughness={0.55}
      metalness={0.28}
    />
  );
}

export default function Arena() {
  const halfWidth = ARENA.width / 2;
  const halfLength = ARENA.length / 2;
  const halfBackNet = ARENA.backNetLength / 2;
  const goalHalf = ARENA.goalWidth / 2;
  const sideBackWallWidth = (ARENA.width - ARENA.goalWidth) / 2;
  const sideBackWallX = goalHalf + sideBackWallWidth / 2;
  const topWallHeight = ARENA.wallHeight - ARENA.goalHeight;
  const wallY = ARENA.wallHeight / 2;
  const lineY = 0.055;
  const netDepth = halfBackNet - halfLength;

  return (
    <group>
      {/* Physics floor — visual floor is separate */}
      <RigidBody type="fixed" friction={1.2} restitution={0.22}>
        <CuboidCollider args={[halfWidth, 0.08, halfBackNet]} position={[0, -0.08, 0]} />
      </RigidBody>

      {/* Visual floor — polished dark turf with clearcoat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[ARENA.width, ARENA.backNetLength]} />
        <meshPhysicalMaterial
          color="#040c14"
          clearcoat={1.0}
          clearcoatRoughness={0.18}
          roughness={0.78}
          metalness={0.22}
        />
      </mesh>

      {/* Floor accent glow strip (perimeter) */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`floor-edge-x-${side}`} position={[side * halfWidth - side * 0.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, ARENA.length]} />
          <meshBasicMaterial color={side < 0 ? "#22d3ee" : "#22d3ee"} transparent opacity={0.6} />
        </mesh>
      ))}
      {([-1, 1] as const).map((side) => (
        <mesh key={`floor-edge-z-${side}`} position={[0, 0.02, side * halfLength - side * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ARENA.width, 0.15]} />
          <meshBasicMaterial color={side < 0 ? "#38bdf8" : "#fb923c"} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* --- Walls & goals --- */}
      <RigidBody type="fixed" friction={0.82} restitution={0.36}>
        {/* Side walls */}
        {([-1, 1] as const).map((side) => (
          <group key={`side-wall-${side}`}>
            <mesh castShadow receiveShadow position={[side * halfWidth, wallY, 0]}>
              <boxGeometry args={[ARENA.wallThickness, ARENA.wallHeight, ARENA.length]} />
              <WallMaterial />
            </mesh>
            <CuboidCollider
              args={[ARENA.wallThickness / 2, wallY, halfLength]}
              position={[side * halfWidth, wallY, 0]}
            />
          </group>
        ))}

        {/* Back walls and goals */}
        {([-1, 1] as const).map((side) => (
          <group key={`back-${side}`}>
            {([-1, 1] as const).map((xSide) => (
              <group key={`${side}-${xSide}`}>
                <mesh castShadow receiveShadow position={[xSide * sideBackWallX, wallY, side * halfLength]}>
                  <boxGeometry args={[sideBackWallWidth, ARENA.wallHeight, ARENA.wallThickness]} />
                  <WallMaterial side={side} />
                </mesh>
                <CuboidCollider
                  args={[sideBackWallWidth / 2, wallY, ARENA.wallThickness / 2]}
                  position={[xSide * sideBackWallX, wallY, side * halfLength]}
                />
              </group>
            ))}

            {/* Top goal wall */}
            <mesh castShadow receiveShadow position={[0, ARENA.goalHeight + topWallHeight / 2, side * halfLength]}>
              <boxGeometry args={[ARENA.goalWidth, topWallHeight, ARENA.wallThickness]} />
              <WallMaterial side={side} />
            </mesh>
            <CuboidCollider
              args={[goalHalf, topWallHeight / 2, ARENA.wallThickness / 2]}
              position={[0, ARENA.goalHeight + topWallHeight / 2, side * halfLength]}
            />

            {/* Goal back net */}
            <mesh castShadow receiveShadow position={[0, ARENA.goalHeight / 2, side * halfBackNet]}>
              <boxGeometry args={[ARENA.goalWidth, ARENA.goalHeight, ARENA.wallThickness]} />
              <meshStandardMaterial
                color="#050810"
                emissive={side < 0 ? "#0ea5e9" : "#f97316"}
                emissiveIntensity={2.2}
                roughness={0.5}
                metalness={0.15}
              />
            </mesh>
            <CuboidCollider
              args={[goalHalf, ARENA.goalHeight / 2, ARENA.wallThickness / 2]}
              position={[0, ARENA.goalHeight / 2, side * halfBackNet]}
            />

            {/* Net side panels */}
            {([-1, 1] as const).map((xSide) => (
              <group key={`net-side-${side}-${xSide}`}>
                <mesh
                  castShadow
                  receiveShadow
                  position={[xSide * goalHalf, ARENA.goalHeight / 2, side * (halfLength + netDepth / 2)]}
                >
                  <boxGeometry args={[ARENA.wallThickness, ARENA.goalHeight, netDepth]} />
                  <meshPhysicalMaterial
                    color={side < 0 ? "#7dd3fc" : "#fdba74"}
                    emissive={side < 0 ? "#0369a1" : "#9a3412"}
                    emissiveIntensity={0.8}
                    metalness={0.1}
                    opacity={0.28}
                    roughness={0.1}
                    transparent
                  />
                </mesh>
                <CuboidCollider
                  args={[ARENA.wallThickness / 2, ARENA.goalHeight / 2, netDepth / 2]}
                  position={[xSide * goalHalf, ARENA.goalHeight / 2, side * (halfLength + netDepth / 2)]}
                />
              </group>
            ))}
          </group>
        ))}
      </RigidBody>

      {/* --- Field markings --- */}
      {/* Halfway line */}
      <mesh position={[0, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ARENA.width, 0.22]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.95} />
      </mesh>

      {/* Center circle */}
      <mesh position={[0, lineY + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[18.432, 0.14, 10, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} />
      </mesh>

      {/* Center dot */}
      <mesh position={[0, lineY + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 2.0, 64]} />
        <meshBasicMaterial color="#f0faff" transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, lineY + 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#f0faff" transparent opacity={0.55} />
      </mesh>

      {/* Lane markers */}
      {([-24, -12, 12, 24] as const).map((x) => (
        <mesh key={x} position={[x, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, ARENA.length - 14]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.22} />
        </mesh>
      ))}

      {/* --- Goal posts & frames --- */}
      {([-1, 1] as const).map((side) => (
        <group key={`goal-frame-${side}`}>
          {/* Goal line glow */}
          <mesh position={[0, lineY, side * halfLength]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ARENA.goalWidth, 0.65]} />
            <meshBasicMaterial color={side < 0 ? "#38bdf8" : "#fb923c"} transparent opacity={0.9} />
          </mesh>

          {/* Crossbar */}
          <mesh position={[0, ARENA.goalHeight + 0.08, side * halfLength]}>
            <boxGeometry args={[ARENA.goalWidth + 0.55, 0.32, 0.32]} />
            <TeamGlow side={side} />
          </mesh>

          {/* Posts */}
          {([-1, 1] as const).map((xSide) => (
            <mesh key={xSide} position={[xSide * goalHalf, ARENA.goalHeight / 2, side * halfLength]}>
              <boxGeometry args={[0.32, ARENA.goalHeight, 0.32]} />
              <TeamGlow side={side} />
            </mesh>
          ))}

          {/* Goal post inner glow strip */}
          <mesh position={[0, ARENA.goalHeight / 2, side * halfLength]}>
            <boxGeometry args={[ARENA.goalWidth, 0.08, 0.08]} />
            <meshBasicMaterial color={side < 0 ? "#38bdf8" : "#fb923c"} />
          </mesh>
        </group>
      ))}

      {/* --- Corner marks --- */}
      {([-1, 1] as const).map((xSide) =>
        ([-1, 1] as const).map((zSide) => (
          <mesh
            key={`corner-${xSide}-${zSide}`}
            position={[xSide * (halfWidth - ARENA.cornerCut / 2), 0.04, zSide * (halfLength - ARENA.cornerCut / 2)]}
            rotation={[-Math.PI / 2, 0, xSide * zSide * Math.PI / 4]}
          >
            <planeGeometry args={[ARENA.cornerCut * 1.42, 0.22]} />
            <meshBasicMaterial color="#f0faff" transparent opacity={0.45} />
          </mesh>
        )),
      )}

      {/* --- Wall accent light strips --- */}
      {([-1, 1] as const).map((side) => (
        <group key={`wall-strips-${side}`}>
          {/* Horizontal accent at 2m height */}
          <mesh position={[side * halfWidth, 2.4, 0]}>
            <boxGeometry args={[0.06, 0.1, ARENA.length]} />
            <meshBasicMaterial color="#22d3ee" />
          </mesh>
          {/* Horizontal accent at mid-wall */}
          <mesh position={[side * halfWidth, 10, 0]}>
            <boxGeometry args={[0.06, 0.1, ARENA.length * 0.85]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}

      {/* Stadium glass panels above side walls */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`glass-${side}`} position={[side * (halfWidth - 0.18), 11.2, 0]}>
          <boxGeometry args={[0.08, 9.5, ARENA.length - ARENA.cornerCut]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            emissive="#075985"
            emissiveIntensity={0.22}
            metalness={0.05}
            opacity={0.14}
            roughness={0.06}
            transparent
            transmission={0.3}
          />
        </mesh>
      ))}

      {/* Stadium roof ring lights (decorative) */}
      {([-36, 36] as const).map((x) =>
        ([-50, 0, 50] as const).map((z) => (
          <group key={`roof-light-${x}-${z}`} position={[x, ARENA.wallHeight - 0.8, z]}>
            <mesh>
              <cylinderGeometry args={[1.4, 1.4, 0.25, 32]} />
              <meshStandardMaterial
                color="#0a1520"
                emissive="#fffbf0"
                emissiveIntensity={3.5}
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[1.2, 0.8, 0.15, 32]} />
              <meshStandardMaterial
                color="#c0a060"
                emissive="#fffbf0"
                emissiveIntensity={1.8}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}
