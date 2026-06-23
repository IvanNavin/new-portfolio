import { CubeWrapper } from "@/cube/CubeWrapper";
import { useRouter } from "@/router/router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { WorksPage } from "@/pages/WorksPage";
import { TalksPage } from "@/pages/TalksPage";
import { ContactPage } from "@/pages/ContactPage";
import { CvOverlay } from "@/components/CvOverlay";
import { CvZoomProvider } from "@/pages/about/cvZoom";

export function App() {
  const { path } = useRouter();

  // The CV lives at /about/cv. It renders as a full-screen overlay above the
  // cube while the cube stays parked on the About face behind it. When opened
  // from the "Read full CV" card, CvOverlay grows the page out of the card.
  const isCv = path === "/about/cv";
  const cubeActive = isCv ? "/about" : path;

  return (
    <CvZoomProvider>
      <CubeWrapper active={cubeActive}>
        <HomePage path="/" />
        <AboutPage path="/about" />
        <WorksPage path="/works" />
        <TalksPage path="/talks" />
        <ContactPage path="/contact" />
      </CubeWrapper>

      {isCv && <CvOverlay />}

      <LanguageSwitcher />
    </CvZoomProvider>
  );
}
