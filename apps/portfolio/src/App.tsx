import { AnimatePresence } from "framer-motion";
import { CubeWrapper } from "@/cube/CubeWrapper";
import { useRouter } from "@/router/router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { WorksPage } from "@/pages/WorksPage";
import { TalksPage } from "@/pages/TalksPage";
import { ContactPage } from "@/pages/ContactPage";
import { CvOverlay } from "@/components/CvOverlay";
import { VisitTracker } from "@/components/VisitTracker";
import { CvZoomProvider } from "@/pages/about/cvZoom";
import { TalkOverlay } from "@/pages/talks/TalkOverlay";
import { isTalkSlug } from "@/pages/talks/talks";
import { WorkOverlay } from "@/pages/works/WorkOverlay";
import { isWorkId } from "@/pages/works/works";

export function App() {
  const { path } = useRouter();

  // The CV lives at /about/cv. It renders as a full-screen overlay above the
  // cube while the cube stays parked on the About face behind it. When opened
  // from the "Read full CV" card, CvOverlay grows the page out of the card.
  const isCv = path === "/about/cv";

  // Talk detail pages live at /talks/<slug> and overlay the Talks face the
  // same way the CV overlays About.
  const talkSlug = path.startsWith("/talks/")
    ? path.slice("/talks/".length)
    : "";
  const isTalk = isTalkSlug(talkSlug);

  // Work detail pages live at /works/<id> and overlay the Works face.
  const workId = path.startsWith("/works/") ? path.slice("/works/".length) : "";
  const isWork = isWorkId(workId);

  // Collapse detail routes to their section by PREFIX (not only for valid ids):
  // an unknown "/works/<bad>" used to fall through to the Home face.
  const cubeActive = isCv
    ? "/about"
    : path.startsWith("/talks/")
      ? "/talks"
      : path.startsWith("/works/")
        ? "/works"
        : path;

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
      <AnimatePresence>
        {isTalk && <TalkOverlay key={talkSlug} slug={talkSlug} />}
      </AnimatePresence>
      <AnimatePresence>
        {isWork && <WorkOverlay key={workId} id={workId} />}
      </AnimatePresence>

      <LanguageSwitcher />
      <VisitTracker />
    </CvZoomProvider>
  );
}
