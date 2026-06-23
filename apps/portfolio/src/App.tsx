import { CubeWrapper } from "@/cube/CubeWrapper";
import { useRouter } from "@/router/router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { WorksPage } from "@/pages/WorksPage";
import { TalksPage } from "@/pages/TalksPage";
import { ContactPage } from "@/pages/ContactPage";
import { CvOverlay } from "@/components/CvOverlay";
import { CvZoomLayer } from "@/components/CvZoomLayer";
import { CvZoomProvider, useCvZoom } from "@/pages/about/cvZoom";

function AppInner() {
  const { path } = useRouter();
  const { zoom } = useCvZoom();

  // The CV lives at /about/cv: a full-screen overlay above the cube while the
  // cube stays parked on the About face. The card→page zoom plays in CvZoomLayer
  // (rendered on top during the transition).
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

      {isCv && <CvOverlay />}
      {zoom && <CvZoomLayer />}

      <LanguageSwitcher />
    </>
  );
}

export function App() {
  return (
    <CvZoomProvider>
      <AppInner />
    </CvZoomProvider>
  );
}
