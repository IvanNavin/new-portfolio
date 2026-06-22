import { useTranslation } from "react-i18next";
import { Magnetic } from "@/components/Magnetic";
import { Link } from "@/router/router";
import { clsxm } from "@/lib/utils";

/**
 * "Read full CV" CTA — animated yellow border + star-blink, navigates to the
 * CV page at /about/cv.
 *
 * TODO(next iteration): replace this flat CTA with a 3D "Read CV" card
 * (igloo.inc-style) that shifts perspective on hover and, on click, scales up
 * seamlessly into the full CV page instead of a plain route change.
 */
export function DownloadButton() {
  const { t } = useTranslation();

  return (
    <div className="mt-12 flex justify-center">
      <Magnetic>
        <Link
          to="/about/cv"
          className={clsxm(
            "text-gold relative inline-block cursor-pointer overflow-hidden",
            "bg-transparent px-6 py-7 text-2xl tracking-wider uppercase",
          )}
        >
          <span className="animate-animate1 absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#0c002b] to-yellow-500" />
          <span className="animate-animate2 absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-[#0c002b] to-yellow-500" />
          <span className="animate-animate3 absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-l from-[#0c002b] to-yellow-500" />
          <span className="animate-animate4 absolute top-0 left-0 h-full w-0.5 bg-gradient-to-t from-[#0c002b] to-yellow-500" />
          <span className="star-blink">
            <div />
          </span>
          <b className="relative z-10">{t("about.readCv")}</b>
        </Link>
      </Magnetic>
    </div>
  );
}
