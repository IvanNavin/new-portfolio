import { clsxm } from "@/lib/utils";
import { Link, useRouter } from "@/router/router";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/works", label: "Works" },
  { to: "/talks", label: "Talks" },
  { to: "/contact", label: "Contact" },
];

/** Pill nav shared across pages to drive cube transitions. */
export function CubeNav({
  position = "bottom",
}: {
  position?: "top" | "bottom";
}) {
  const { path } = useRouter();
  return (
    <nav
      className={clsxm(
        "absolute left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full border border-white/15 bg-black/30 p-1.5 backdrop-blur-md",
        position === "top" ? "top-8" : "bottom-10",
      )}
    >
      {LINKS.map((l) => {
        const isActive = path === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
