import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";

// World-space width the text is auto-scaled to fill. With the camera below this
// fills ~85% of the (fixed-aspect) canvas width regardless of string/viewport.
const TARGET_WIDTH = 4.9;

function Lettering({ text }: { text: string }) {
  const tilt = useRef<THREE.Group>(null);
  const fit = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);

  // Measure the actual glyph geometry and scale/centre it to TARGET_WIDTH so
  // the lettering always fills the same fraction of the card — any length.
  useLayoutEffect(() => {
    const m = mesh.current;
    const g = fit.current;
    if (!m || !g || !m.geometry) return;
    m.geometry.computeBoundingBox();
    const bb = m.geometry.boundingBox;
    if (!bb) return;
    const w = bb.max.x - bb.min.x;
    m.position.set(
      -(bb.max.x + bb.min.x) / 2,
      -(bb.max.y + bb.min.y) / 2,
      -(bb.max.z + bb.min.z) / 2,
    );
    g.scale.setScalar(w > 0 ? TARGET_WIDTH / w : 1);
  }, [text]);

  useFrame((state) => {
    const g = tilt.current;
    if (!g) return;
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
    <group ref={tilt}>
      <group ref={fit}>
        <Text3D
          ref={mesh}
          font="/fonts/helvetiker_bold.typeface.json"
          size={1}
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
      </group>
    </group>
  );
}

/** Transparent r3f canvas hosting the auto-fit beveled 3D "Read full CV" text. */
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
