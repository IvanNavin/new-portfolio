import { CubeNav } from "@/components/CubeNav";
import type { PageProps } from "./types";

export function TalksPage(_props: PageProps) {
  return (
    <main className="relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_25%_25%,#0c4a6e,transparent_60%),radial-gradient(circle_at_80%_80%,#0284c7,transparent_55%)] bg-[#04121c]">
      <div className="text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.3em] text-sky-300/80 uppercase">
          Bottom face · /talks
        </p>
        <h1 className="text-7xl font-bold tracking-tight text-white">Talks</h1>
        <p className="mt-4 max-w-md text-balance text-white/60">
          Arrives from below (vertical roll). Placeholder for Talks and its 4
          sub-routes, ported later.
        </p>
      </div>
      <CubeNav />
    </main>
  );
}
