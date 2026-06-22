import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import * as THREE from "three";

/** Real extruded 3D lettering that tilts toward the cursor. */
function Lettering({ text }: { text: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    // Gentle tilt toward the cursor; kept small so the text reads centred.
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      state.pointer.x * 0.28,
      0.08,
    );
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      -state.pointer.y * 0.18,
      0.08,
    );
  });

  return (
    <group ref={group}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.3}
          height={0.16}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.022}
          bevelSize={0.016}
          bevelSegments={5}
          letterSpacing={0.04}
        >
          {text}
          <meshStandardMaterial
            color="#e0a52b"
            metalness={0.55}
            roughness={0.28}
          />
        </Text3D>
      </Center>
    </group>
  );
}

/** Transparent r3f canvas hosting the beveled 3D "Read full CV" text. */
export function ReadCvText3D({ text }: { text: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} />
      <pointLight position={[-5, -3, 4]} intensity={1.4} color="#ffcf6b" />
      <Suspense fallback={null}>
        <Lettering text={text} />
      </Suspense>
    </Canvas>
  );
}
