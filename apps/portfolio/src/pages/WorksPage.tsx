import { CubeNav } from "@/components/CubeNav";
import type { PageProps } from "./types";

export function WorksPage(_props: PageProps) {
  return (
    <main className="relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_25%,#9f1239,transparent_60%),radial-gradient(circle_at_75%_80%,#c2410c,transparent_55%)] bg-[#140505]">
      <div className="text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.3em] text-rose-300/80 uppercase">
          Left face · /works
        </p>
        <h1 className="text-7xl font-bold tracking-tight text-white">Works</h1>
        <p className="mt-4 max-w-md text-balance text-white/60">
          Arrives from the left. Placeholder for the My Works grid and its 11
          sub-routes, ported later.
        </p>
      </div>
      <CubeNav />
    </main>
  );
}
