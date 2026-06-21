import { CubeWrapper } from "@/cube/CubeWrapper";
import { useRouter } from "@/router/router";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { WorksPage } from "@/pages/WorksPage";

export function App() {
  const { path } = useRouter();

  // Every page is mounted at once; CubeWrapper only rotates to the active one.
  return (
    <CubeWrapper active={path}>
      <HomePage path="/" />
      <AboutPage path="/about" />
      <WorksPage path="/works" />
    </CubeWrapper>
  );
}
