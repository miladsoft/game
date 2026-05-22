"use client";

export default function Lights() {
  return (
    <>
      {/* Base ambient */}
      <ambientLight intensity={0.12} color="#0a1520" />
      <hemisphereLight args={["#0d2035", "#030508", 0.65]} />

      {/* Main shadow-casting sun */}
      <directionalLight
        castShadow
        color="#e8f0ff"
        intensity={1.6}
        position={[0, 48, 12]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0008}
      />

      {/* 4 stadium spotlights — high corners */}
      <spotLight
        position={[-38, 30, -52]}
        angle={0.52}
        penumbra={0.45}
        intensity={240}
        color="#fff8ee"
        distance={130}
        castShadow={false}
      />
      <spotLight
        position={[38, 30, -52]}
        angle={0.52}
        penumbra={0.45}
        intensity={240}
        color="#fff8ee"
        distance={130}
        castShadow={false}
      />
      <spotLight
        position={[-38, 30, 52]}
        angle={0.52}
        penumbra={0.45}
        intensity={240}
        color="#fff8ee"
        distance={130}
        castShadow={false}
      />
      <spotLight
        position={[38, 30, 52]}
        angle={0.52}
        penumbra={0.45}
        intensity={240}
        color="#fff8ee"
        distance={130}
        castShadow={false}
      />

      {/* 2 mid-field fill lights */}
      <spotLight
        position={[0, 28, -26]}
        angle={0.6}
        penumbra={0.5}
        intensity={120}
        color="#fffbf5"
        distance={90}
        castShadow={false}
      />
      <spotLight
        position={[0, 28, 26]}
        angle={0.6}
        penumbra={0.5}
        intensity={120}
        color="#fffbf5"
        distance={90}
        castShadow={false}
      />

      {/* Blue goal atmosphere */}
      <pointLight color="#22d3ee" intensity={140} position={[0, 5, -56]} distance={48} decay={2} />
      <pointLight color="#0ea5e9" intensity={55} position={[-18, 3, -52]} distance={30} decay={2} />
      <pointLight color="#0ea5e9" intensity={55} position={[18, 3, -52]} distance={30} decay={2} />

      {/* Orange goal atmosphere */}
      <pointLight color="#f97316" intensity={140} position={[0, 5, 56]} distance={48} decay={2} />
      <pointLight color="#f97316" intensity={55} position={[-18, 3, 52]} distance={30} decay={2} />
      <pointLight color="#f97316" intensity={55} position={[18, 3, 52]} distance={30} decay={2} />

      {/* Center pitch fill */}
      <pointLight color="#7dd3fc" intensity={18} position={[0, 3, 0]} distance={30} decay={2} />
    </>
  );
}
