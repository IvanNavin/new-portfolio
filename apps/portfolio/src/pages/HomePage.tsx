import { CubeNav } from "@/components/CubeNav";
import type { PageProps } from "./types";

export function HomePage(_props: PageProps) {
  return (
    <main className="relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#312e81,transparent_60%),radial-gradient(circle_at_80%_80%,#6d28d9,transparent_55%)] bg-[#0a0a0f]">
      <div className="text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.3em] text-indigo-300/80 uppercase">
          Front face · /
        </p>
        <h1 className="text-7xl font-bold tracking-tight text-white">Home</h1>
        <p className="mt-4 max-w-md text-balance text-white/60">
          Cube prototype. Use the nav to spin to another face — both pages stay
          live and visible mid-rotation.
        </p>
      </div>
      <CubeNav />
    </main>
  );
}
