import { CubeNav } from "@/components/CubeNav";
import type { PageProps } from "./types";

export function AboutPage(_props: PageProps) {
  return (
    <main className="relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_25%_25%,#065f46,transparent_60%),radial-gradient(circle_at_75%_75%,#0d9488,transparent_55%)] bg-[#04100c]">
      <div className="text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.3em] text-emerald-300/80 uppercase">
          Right face · /about
        </p>
        <h1 className="text-7xl font-bold tracking-tight text-white">About</h1>
        <p className="mt-4 max-w-md text-balance text-white/60">
          Arrives from the right. This is a placeholder — real About content
          gets ported from <code className="text-emerald-300">main</code> once
          the cube is locked in.
        </p>
      </div>
      <CubeNav />
    </main>
  );
}
