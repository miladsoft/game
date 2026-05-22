"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { ARENA } from "@/lib/game/constants";

function TeamMaterial({ side }: { side: number }) {
  return (
    <meshStandardMaterial
      color={side < 0 ? "#38bdf8" : "#fb923c"}
      emissive={side < 0 ? "#0ea5e9" : "#f97316"}
      emissiveIntensity={1.35}
      roughness={0.24}
      metalness={0.2}
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
  const lineY = 0.065;
  const netDepth = halfBackNet - halfLength;

  return (
    <group>
      <RigidBody type="fixed" friction={1.15} restitution={0.24}>
        <mesh receiveShadow position={[0, -0.06, 0]}>
          <boxGeometry args={[ARENA.width, 0.12, ARENA.backNetLength]} />
          <meshStandardMaterial color="#15202b" roughness={0.72} metalness={0.22} />
        </mesh>
        <CuboidCollider args={[halfWidth, 0.08, halfBackNet]} position={[0, -0.08, 0]} />
      </RigidBody>

      <RigidBody type="fixed" friction={0.82} restitution={0.36}>
        {[-1, 1].map((side) => (
          <group key={`side-wall-${side}`}>
            <mesh castShadow receiveShadow position={[side * halfWidth, wallY, 0]}>
              <boxGeometry args={[ARENA.wallThickness, ARENA.wallHeight, ARENA.length]} />
              <meshStandardMaterial color="#142338" emissive="#061827" emissiveIntensity={0.28} roughness={0.45} metalness={0.25} />
            </mesh>
            <CuboidCollider args={[ARENA.wallThickness / 2, wallY, halfLength]} position={[side * halfWidth, wallY, 0]} />
          </group>
        ))}

        {[-1, 1].map((side) => (
          <group key={`back-wall-${side}`}>
            {[-1, 1].map((xSide) => (
              <group key={`${side}-${xSide}`}>
                <mesh castShadow receiveShadow position={[xSide * sideBackWallX, wallY, side * halfLength]}>
                  <boxGeometry args={[sideBackWallWidth, ARENA.wallHeight, ARENA.wallThickness]} />
                  <meshStandardMaterial
                    color={side < 0 ? "#12324f" : "#4b2617"}
                    emissive={side < 0 ? "#0369a1" : "#c2410c"}
                    emissiveIntensity={0.18}
                    roughness={0.44}
                    metalness={0.22}
                  />
                </mesh>
                <CuboidCollider
                  args={[sideBackWallWidth / 2, wallY, ARENA.wallThickness / 2]}
                  position={[xSide * sideBackWallX, wallY, side * halfLength]}
                />
              </group>
            ))}

            <mesh castShadow receiveShadow position={[0, ARENA.goalHeight + topWallHeight / 2, side * halfLength]}>
              <boxGeometry args={[ARENA.goalWidth, topWallHeight, ARENA.wallThickness]} />
              <meshStandardMaterial
                color={side < 0 ? "#12324f" : "#4b2617"}
                emissive={side < 0 ? "#0369a1" : "#c2410c"}
                emissiveIntensity={0.18}
                roughness={0.44}
                metalness={0.22}
              />
            </mesh>
            <CuboidCollider
              args={[goalHalf, topWallHeight / 2, ARENA.wallThickness / 2]}
              position={[0, ARENA.goalHeight + topWallHeight / 2, side * halfLength]}
            />

            <mesh castShadow receiveShadow position={[0, ARENA.goalHeight / 2, side * halfBackNet]}>
              <boxGeometry args={[ARENA.goalWidth, ARENA.goalHeight, ARENA.wallThickness]} />
              <meshStandardMaterial color="#050816" emissive={side < 0 ? "#0ea5e9" : "#f97316"} emissiveIntensity={0.2} roughness={0.5} metalness={0.15} />
            </mesh>
            <CuboidCollider
              args={[goalHalf, ARENA.goalHeight / 2, ARENA.wallThickness / 2]}
              position={[0, ARENA.goalHeight / 2, side * halfBackNet]}
            />

            {[-1, 1].map((xSide) => (
              <group key={`net-side-${side}-${xSide}`}>
                <mesh castShadow receiveShadow position={[xSide * goalHalf, ARENA.goalHeight / 2, side * (halfLength + netDepth / 2)]}>
                  <boxGeometry args={[ARENA.wallThickness, ARENA.goalHeight, netDepth]} />
                  <meshPhysicalMaterial
                    color={side < 0 ? "#7dd3fc" : "#fdba74"}
                    emissive={side < 0 ? "#075985" : "#9a3412"}
                    emissiveIntensity={0.2}
                    metalness={0.08}
                    opacity={0.22}
                    roughness={0.12}
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

      <gridHelper args={[ARENA.backNetLength, 40, "#2dd4bf", "#314154"]} position={[0, 0.035, 0]} />

      <mesh position={[0, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ARENA.width, 0.14]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, lineY + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[18.432, 0.075, 10, 128]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, lineY + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.85, 64]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.72} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={`goal-line-${side}`}>
          <mesh position={[0, 0.07, side * halfLength]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ARENA.goalWidth, 0.55]} />
            <meshBasicMaterial color={side < 0 ? "#38bdf8" : "#fb923c"} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, ARENA.goalHeight + 0.05, side * halfLength]}>
            <boxGeometry args={[ARENA.goalWidth + 0.45, 0.25, 0.25]} />
            <TeamMaterial side={side} />
          </mesh>
          {[-1, 1].map((xSide) => (
            <mesh key={xSide} position={[xSide * goalHalf, ARENA.goalHeight / 2, side * halfLength]}>
              <boxGeometry args={[0.28, ARENA.goalHeight, 0.28]} />
              <TeamMaterial side={side} />
            </mesh>
          ))}
        </group>
      ))}

      {[-1, 1].map((side) => (
        <mesh key={`glass-${side}`} position={[side * (halfWidth - 0.18), 10.8, 0]}>
          <boxGeometry args={[0.08, 8.4, ARENA.length - ARENA.cornerCut]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            emissive="#075985"
            emissiveIntensity={0.18}
            metalness={0.05}
            opacity={0.16}
            roughness={0.08}
            transparent
            transmission={0.25}
          />
        </mesh>
      ))}

      {[-1, 1].map((xSide) =>
        [-1, 1].map((zSide) => (
          <mesh
            key={`corner-${xSide}-${zSide}`}
            position={[xSide * (halfWidth - ARENA.cornerCut / 2), 0.08, zSide * (halfLength - ARENA.cornerCut / 2)]}
            rotation={[-Math.PI / 2, 0, xSide * zSide * Math.PI / 4]}
          >
            <planeGeometry args={[ARENA.cornerCut * 1.42, 0.16]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.35} />
          </mesh>
        )),
      )}

      {[-24, -12, 12, 24].map((x) => (
        <mesh key={x} position={[x, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, ARENA.length - 12]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.18} />
        </mesh>
      ))}
    </group>
  );
}
