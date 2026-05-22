"use client";

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#7dd3fc", "#120819", 1.1]} />
      <directionalLight
        castShadow
        intensity={2.2}
        position={[18, 34, 22]}
        shadow-camera-bottom={-70}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <spotLight
        angle={0.5}
        castShadow
        color="#70e1ff"
        intensity={75}
        penumbra={0.65}
        position={[-30, 25, -46]}
      />
      <spotLight
        angle={0.5}
        castShadow
        color="#ffb86b"
        intensity={64}
        penumbra={0.7}
        position={[30, 25, 46]}
      />
      <pointLight color="#38bdf8" intensity={70} position={[0, 6, -52]} distance={36} />
      <pointLight color="#fb923c" intensity={70} position={[0, 6, 52]} distance={36} />
    </>
  );
}
