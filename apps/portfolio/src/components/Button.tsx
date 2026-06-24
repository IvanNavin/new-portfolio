import MONK from "@/assets/img/monk.png";
import { clsxm } from "@/lib/utils";

type Props = {
  text: string;
  href: string;
  className?: string;
};

/**
 * The portfolio's signature circular CTA: text rotating around a ring with the
 * "monk" glyph at its centre, tilting in 3D on hover. Opens an external link.
 */
export const Button = ({ text, href, className }: Props) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={clsxm(
      "group relative inline-block size-[100px] text-white",
      className,
    )}
  >
    <img
      src={MONK}
      alt=""
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 size-[30px] -translate-x-1/2 -translate-y-1/2"
    />
    <svg
      width={100}
      height={100}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      className="transition-transform duration-200 ease-linear group-hover:[transform:rotate3d(-1,1,1,-65deg)_scale(1.5)]"
    >
      <defs>
        <path
          id={`textcircle-${text.replace(/\s+/g, "-")}`}
          d="M50,250c0-110.5,89.5-200,200-200s200,89.5,200,200s-89.5,200-200,200S50,360.5,50,250"
        />
      </defs>
      <text
        dy="70"
        textLength="1220"
        className="animate-rotate fill-white text-[63px] tracking-[17px] uppercase"
      >
        <textPath href={`#textcircle-${text.replace(/\s+/g, "-")}`}>
          {text}
        </textPath>
      </text>
    </svg>
  </a>
);
