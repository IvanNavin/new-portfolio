import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Text3D,
  Center,
  MeshTransmissionMaterial,
  Environment,
  Lightformer,
} from "@react-three/drei";
import * as THREE from "three";

const FONT = "/fonts/helvetiker_bold.typeface.json";

// Deep extrusion so the lettering reads as a solid block of glass.
const GLYPH = {
  size: 1,
  height: 0.6,
  curveSegments: 10,
  bevelEnabled: true,
  bevelThickness: 0.06,
  bevelSize: 0.03,
  bevelSegments: 6,
  letterSpacing: 0.02,
} as const;

/** Bright amber glass — refracts the card behind it, gold-tinted by thickness. */
function Glass() {
  return (
    <MeshTransmissionMaterial
      transmission={1}
      thickness={0.9}
      roughness={0.08}
      ior={1.5}
      chromaticAberration={0.06}
      anisotropy={0.3}
      distortion={0.12}
      distortionScale={0.25}
      temporalDistortion={0.06}
      attenuationColor="#f0b53a"
      attenuationDistance={1.8}
      color="#fff1cf"
      samples={6}
      resolution={512}
      backside
    />
  );
}

/**
 * Auto-fitting 3D lettering.
 *  - "line"  → one line ("READ FULL CV"), scaled to spill past the card.
 *  - "stack" → each word centered on its own line, the whole block rotated 45°,
 *              fit inside the card (phones only).
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
    // Measure with the resting tilt removed; the 45° stack rotation stays since
    // it lives on an inner group, so the box reflects the rotated extent.
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
        : Math.min((viewport.width * 0.92) / w, (viewport.height * 0.92) / h);
    g.scale.setScalar(s);
    g.position.set(-cx * s, -cy * s, 0);
  }, [text, mode, words, viewport.width, viewport.height]);

  // Rest at a slight angle so the extruded sides are always visible (= reads as
  // 3D even with the cursor centered), then lean toward the pointer.
  useFrame((state) => {
    const t = tilt.current;
    if (!t) return;
    t.rotation.y = THREE.MathUtils.lerp(
      t.rotation.y,
      0.18 + state.pointer.x * 0.22,
      0.08,
    );
    t.rotation.x = THREE.MathUtils.lerp(
      t.rotation.x,
      -0.08 - state.pointer.y * 0.16,
      0.08,
    );
  });

  return (
    <group ref={tilt}>
      <group ref={fit}>
        {mode === "line" ? (
          <Center>
            <Text3D font={FONT} {...GLYPH}>
              {text}
              <Glass />
            </Text3D>
          </Center>
        ) : (
          <group rotation={[0, 0, Math.PI / 4]}>
            {words.map((word, i) => (
              <Center key={`${word}-${i}`} position={[0, (1 - i) * 1.5, 0]}>
                <Text3D font={FONT} {...GLYPH}>
                  {word}
                  <Glass />
                </Text3D>
              </Center>
            ))}
          </group>
        )}
      </group>
    </group>
  );
}

/** Transparent r3f canvas hosting the auto-fit beveled glass "Read full CV". */
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-5, -3, 4]} intensity={1.0} color="#ffcf6b" />
      {/* Procedural env (no network HDR) — gives the glass its reflections. */}
      <Environment resolution={256} background={false}>
        <Lightformer
          intensity={2.4}
          position={[0, 3, 5]}
          scale={[8, 6, 1]}
          color="#fff3d6"
        />
        <Lightformer
          intensity={1.8}
          position={[-4, -2, 3]}
          scale={[5, 5, 1]}
          color="#ffcf6b"
        />
        <Lightformer
          intensity={1.2}
          position={[4, -1, 2]}
          scale={[4, 4, 1]}
          color="#ffffff"
        />
      </Environment>
      <Suspense fallback={null}>
        <Lettering text={text} mode={mode} />
      </Suspense>
    </Canvas>
  );
}
