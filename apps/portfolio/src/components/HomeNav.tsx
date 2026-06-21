import { useTranslation } from "react-i18next";
import { NavMenuItem, type NavMenuItemData } from "@/components/NavMenuItem";

/**
 * Home's signature left-rail menu. Read top-to-bottom the first words spell
 * "Hello · My · Name's · Ivan"; hovering each reveals the destination
 * (About Me / My Works / Contacts / Talks) and navigates the cube there.
 */
export function HomeNav() {
  const { t } = useTranslation();

  const items: NavMenuItemData[] = [
    { first: t("main.hello"), second: t("main.aboutMe"), href: "/about" },
    { first: t("main.my"), second: t("main.myWorks"), href: "/works" },
    { first: t("main.names"), second: t("main.contacts"), href: "/contact" },
    { first: t("main.ivan"), second: t("main.talks"), href: "/talks" },
  ];

  return (
    <nav className="absolute top-1/2 left-[clamp(24px,8vw,114px)] z-30 flex -translate-y-1/2 flex-col items-start">
      {items.map((item, index) => (
        <NavMenuItem key={item.href} item={item} index={index} />
      ))}
    </nav>
  );
}
