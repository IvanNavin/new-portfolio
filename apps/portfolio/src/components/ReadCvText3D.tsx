import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";

const FONT = "/fonts/helvetiker_bold.typeface.json";

// Chunky extrusion (relative to size = 1) so the lettering reads as solid 3D.
const GLYPH = {
  size: 1,
  height: 0.42,
  curveSegments: 8,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.035,
  bevelSegments: 5,
  letterSpacing: 0.04,
} as const;

function Material() {
  return (
    <meshStandardMaterial color="#e0a52b" metalness={0.55} roughness={0.28} />
  );
}

/**
 * Auto-fitting 3D lettering.
 *  - "line"  → one line ("READ FULL CV"), scaled to ~92% of the (oversized)
 *              canvas so it spills past the card on desktop.
 *  - "stack" → one word per line on a diagonal staircase, fit inside the card
 *              for narrow screens.
 */
function Lettering({ text, mode }: { text: string; mode: "line" | "stack" }) {
  const { viewport } = useThree();
  const tilt = useRef<THREE.Group>(null);
  const fit = useRef<THREE.Group>(null);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useLayoutEffect(() => {
    const t = tilt.current;
    const g = fit.current;
    if (!t || !g) return;
    // Measure with no rotation/scale so the box is the raw geometry extent.
    t.rotation.set(0, 0, 0);
    g.scale.setScalar(1);
    g.position.set(0, 0, 0);
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;
    if (w <= 0 || h <= 0) return;
    const cx = (box.max.x + box.min.x) / 2;
    const cy = (box.max.y + box.min.y) / 2;
    const s =
      mode === "line"
        ? (viewport.width * 0.92) / w
        : Math.min((viewport.width * 0.9) / w, (viewport.height * 0.84) / h);
    g.scale.setScalar(s);
    g.position.set(-cx * s, -cy * s, 0);
  }, [text, mode, words, viewport.width, viewport.height]);

  useFrame((state) => {
    const t = tilt.current;
    if (!t) return;
    t.rotation.y = THREE.MathUtils.lerp(
      t.rotation.y,
      state.pointer.x * 0.26,
      0.08,
    );
    t.rotation.x = THREE.MathUtils.lerp(
      t.rotation.x,
      -state.pointer.y * 0.16,
      0.08,
    );
  });

  return (
    <group ref={tilt}>
      <group ref={fit}>
        {mode === "line" ? (
          <Text3D font={FONT} {...GLYPH}>
            {text}
            <Material />
          </Text3D>
        ) : (
          words.map((word, i) => (
            <Text3D
              key={`${word}-${i}`}
              font={FONT}
              {...GLYPH}
              position={[i * 0.62, -i * 1.18, 0]}
            >
              {word}
              <Material />
            </Text3D>
          ))
        )}
      </group>
    </group>
  );
}

/** Transparent r3f canvas hosting the auto-fit beveled 3D "Read full CV" text. */
export function ReadCvText3D({
  text,
  mode,
}: {
  text: string;
  mode: "line" | "stack";
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} />
      <pointLight position={[-5, -3, 4]} intensity={1.4} color="#ffcf6b" />
      <Suspense fallback={null}>
        <Lettering text={text} mode={mode} />
      </Suspense>
    </Canvas>
  );
}
