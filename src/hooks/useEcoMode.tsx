import React from "react";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { applyEcoModeToDocument } from "@/lib/eco-mode-utils";

export function EcoModeRootWrapper({ children }: { children: React.ReactNode }) {
  const { isEcoMode } = useEcoMode();

  React.useEffect(() => {
    applyEcoModeToDocument(isEcoMode);
  }, [isEcoMode]);

  return <>{children}</>;
}
