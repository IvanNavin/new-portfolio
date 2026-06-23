import { type ReactNode } from "react";
import { type TFunction } from "i18next";
import { Magnetic } from "@/components/Magnetic";
import { GitHub, LinkedIn, Mail } from "@/components/svg";
import { clsxm } from "@/lib/utils";
import {
  CONTACT_EMAIL,
  CONTACT_GITHUB,
  CONTACT_LINKEDIN,
} from "./contactConfig";

type DirectLink = {
  key: string;
  href: string;
  label: string;
  external: boolean;
  icon: ReactNode;
};

/**
 * Direct contact buttons (Email / LinkedIn / GitHub) — a fast path above the
 * Cal.com embed for folks who'd rather drop a line than book a slot. Each uses
 * <Magnetic> for the site's cursor-pull and a gold-on-hover border.
 */
export const ContactLinks = ({ t }: { t: TFunction }) => {
  const links: DirectLink[] = [
    {
      key: "email",
      href: `mailto:${CONTACT_EMAIL}`,
      label: t("contacts.email"),
      external: false,
      icon: <Mail width={20} height={20} />,
    },
    {
      key: "linkedin",
      href: CONTACT_LINKEDIN,
      label: "LinkedIn",
      external: true,
      icon: <LinkedIn width={20} height={20} />,
    },
    {
      key: "github",
      href: CONTACT_GITHUB,
      label: "GitHub",
      external: true,
      icon: <GitHub width={20} height={20} />,
    },
  ];

  return (
    <ul className="flex flex-wrap items-center justify-center gap-4">
      {links.map((link) => (
        <li key={link.key}>
          <Magnetic>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={clsxm(
                "group inline-flex items-center gap-2.5 rounded-full",
                "border border-white/20 bg-white/[0.03] px-5 py-2.5",
                "text-sm tracking-widest text-white/85 uppercase",
                "transition-colors duration-200",
                "hover:border-yellow-400/70 hover:bg-yellow-400/[0.06]",
                "hover:text-yellow-300 focus-visible:outline-none",
                "focus-visible:border-yellow-400 focus-visible:bg-yellow-400/10",
              )}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </a>
          </Magnetic>
        </li>
      ))}
    </ul>
  );
};
