import { CubeWrapper } from "@/cube/CubeWrapper";
import { useRouter } from "@/router/router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { WorksPage } from "@/pages/WorksPage";
import { TalksPage } from "@/pages/TalksPage";
import { ContactPage } from "@/pages/ContactPage";

export function App() {
  const { path } = useRouter();

  // Every page is mounted at once; CubeWrapper only rotates to the active one.
  // The language switcher lives outside the cube as a fixed global overlay.
  return (
    <>
      <CubeWrapper active={path}>
        <HomePage path="/" />
        <AboutPage path="/about" />
        <WorksPage path="/works" />
        <TalksPage path="/talks" />
        <ContactPage path="/contact" />
      </CubeWrapper>
      <LanguageSwitcher />
    </>
  );
}
