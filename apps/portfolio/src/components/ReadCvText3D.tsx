import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D, Center, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/** Cursor position in NDC-ish space (x: -1..1 left→right, y: -1..1 bottom→top). */
export type Pointer = { x: number; y: number };

const FONT = "/fonts/helvetiker_bold.typeface.json";

// Deep extrusion so the lettering reads as a solid 3D block.
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

// Fixed 3D viewing angle so the extruded sides catch light even at rest (and
// even on mobile, where there's no cursor to tilt it).
const VIEW = { pitch: -0.1, yaw: 0.16 };

/** Bright metallic gold — has a small emissive floor so it never goes black. */
function Gold() {
  return (
    <meshStandardMaterial
      color="#e7a92c"
      metalness={0.6}
      roughness={0.28}
      emissive="#6b4a12"
      emissiveIntensity={0.3}
      envMapIntensity={1.3}
    />
  );
}

/**
 * Auto-fitting 3D lettering.
 *  - "line"  → one line ("READ FULL CV"), scaled to spill past the card; tilts
 *              toward the cursor.
 *  - "stack" → each word centered on its own line, the whole block rotated 45°,
 *              fit inside the card. Static (phones have no hover).
 */
function Lettering({
  text,
  mode,
  pointer,
  progress,
}: {
  text: string;
  mode: "line" | "stack";
  pointer: RefObject<Pointer>;
  progress?: MotionValue<number>;
}) {
  const { viewport } = useThree();
  const tilt = useRef<THREE.Group>(null); // interactive cursor delta (0 at rest)
  const fit = useRef<THREE.Group>(null); // scale + center (measured)
  const interactive = mode === "line";
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useLayoutEffect(() => {
    const t = tilt.current;
    const g = fit.current;
    if (!t || !g) return;
    // Reset the interactive tilt + fit, but keep the inner VIEW/45° rotations so
    // the measured box (and thus the centering) matches what's on screen.
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
        : Math.min((viewport.width * 0.98) / w, (viewport.height * 0.98) / h);
    g.scale.setScalar(s);
    g.position.set(-cx * s, -cy * s, 0);
  }, [text, mode, words, viewport.width, viewport.height]);

  // Desktop leans toward the pointer; mobile stays put. The pointer is fed in
  // from the card's DOM mousemove (the canvas has pointer-events:none so it
  // can't destabilise the <a> hover box), not from r3f's own canvas events.
  useFrame(() => {
    const t = tilt.current;
    if (!t) return;
    // Fly-through: accelerate the lettering straight at the camera (z=6) so we
    // pass through it. The constant VIEW angle keeps the extruded side faces in
    // view as a letter rushes past.
    const fly = progress ? progress.get() : 0;
    if (fly > 0.0001) {
      const e = fly * fly; // ease-in: slow start, rushes past at the end
      t.rotation.set(0, 0, 0);
      // Start far (z=-7 → small, ~card size) and rush THROUGH the camera (z=6).
      t.position.z = -7 + e * 16;
      return;
    }
    t.position.z = 0;
    const pt = pointer.current;
    const ty = interactive ? pt.x * 0.22 : 0;
    const tx = interactive ? -pt.y * 0.16 : 0;
    t.rotation.y = THREE.MathUtils.lerp(t.rotation.y, ty, 0.08);
    t.rotation.x = THREE.MathUtils.lerp(t.rotation.x, tx, 0.08);
  });

  return (
    <group ref={tilt}>
      <group ref={fit}>
        <group rotation={[VIEW.pitch, VIEW.yaw, 0]}>
          {mode === "line" ? (
            <Center>
              <Text3D font={FONT} {...GLYPH}>
                {text}
                <Gold />
              </Text3D>
            </Center>
          ) : (
            <group rotation={[0, 0, Math.PI / 4]}>
              {words.map((word, i) => (
                <Center key={`${word}-${i}`} position={[0, (1 - i) * 1.5, 0]}>
                  <Text3D font={FONT} {...GLYPH}>
                    {word}
                    <Gold />
                  </Text3D>
                </Center>
              ))}
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

/** Transparent r3f canvas hosting the auto-fit beveled gold "Read full CV". */
export function ReadCvText3D({
  text,
  mode,
  pointer,
  progress,
}: {
  text: string;
  mode: "line" | "stack";
  pointer: RefObject<Pointer>;
  progress?: MotionValue<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      // Measure by layout size, NOT getBoundingClientRect — otherwise the card's
      // zoom CSS-scale would size the drawing buffer to the scaled dimensions and
      // never recover (text vanishes after the zoom).
      resize={{ offsetSize: true }}
      // pointer-events:none so the canvas (which sits inside the tilting card)
      // never becomes the hover hit-target — that's what caused the edge jitter.
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-5, -3, 4]} intensity={1.3} color="#ffcf6b" />
      {/* Procedural env (no network HDR) — gives the gold its reflections. */}
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
        <Lettering
          text={text}
          mode={mode}
          pointer={pointer}
          progress={progress}
        />
      </Suspense>
    </Canvas>
  );
}
