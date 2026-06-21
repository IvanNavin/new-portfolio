import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { RouterProvider } from "@/router/router";
import "@/i18n/i18n";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
);
