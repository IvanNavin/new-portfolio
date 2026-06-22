import { CubeWrapper } from "@/cube/CubeWrapper";
import { useRouter } from "@/router/router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { WorksPage } from "@/pages/WorksPage";
import { TalksPage } from "@/pages/TalksPage";
import { ContactPage } from "@/pages/ContactPage";
import { CvPage } from "@/pages/about/cv/CvPage";

export function App() {
  const { path } = useRouter();

  // The CV lives at /about/cv. It renders as a full-screen overlay above the
  // cube while the cube stays parked on the About face behind it.
  // TODO(next iteration): animate this overlay open from the "Read CV" card
  // (scale-up) instead of an instant takeover.
  const isCv = path === "/about/cv";
  const cubeActive = isCv ? "/about" : path;

  return (
    <>
      <CubeWrapper active={cubeActive}>
        <HomePage path="/" />
        <AboutPage path="/about" />
        <WorksPage path="/works" />
        <TalksPage path="/talks" />
        <ContactPage path="/contact" />
      </CubeWrapper>

      {isCv && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black">
          <CvPage />
        </div>
      )}

      <LanguageSwitcher />
    </>
  );
}
