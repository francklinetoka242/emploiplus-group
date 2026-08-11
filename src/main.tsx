import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import App from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/styles.css";
import { EcoModeProvider } from "@/contexts/EcoModeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>,
);
