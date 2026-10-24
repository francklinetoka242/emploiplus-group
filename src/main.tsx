import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/styles.css";
import { EcoModeProvider } from "@/contexts/EcoModeContext";
import { IconContext } from "@phosphor-icons/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IconContext.Provider value={{ weight: "bold" }}>
      <HelmetProvider>
        <EcoModeProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
            <Analytics />
          </BrowserRouter>
        </EcoModeProvider>
      </HelmetProvider>
    </IconContext.Provider>
  </React.StrictMode>,
);
