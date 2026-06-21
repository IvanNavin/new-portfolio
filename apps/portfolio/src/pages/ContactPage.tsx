import { CubeNav } from "@/components/CubeNav";
import type { PageProps } from "./types";

export function ContactPage(_props: PageProps) {
  return (
    <main className="relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#78350f,transparent_60%),radial-gradient(circle_at_75%_80%,#d97706,transparent_55%)] bg-[#140d04]">
      <div className="text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.3em] text-amber-300/80 uppercase">
          Top face · /contact
        </p>
        <h1 className="text-7xl font-bold tracking-tight text-white">
          Contact
        </h1>
        <p className="mt-4 max-w-md text-balance text-white/60">
          Arrives from the top (vertical roll). Placeholder for the Cal.com
          booking + direct links, ported later.
        </p>
      </div>
      <CubeNav />
    </main>
  );
}
