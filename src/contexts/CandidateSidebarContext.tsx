import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface CandidateSidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CandidateSidebarContext = createContext<CandidateSidebarContextType | undefined>(undefined);

export function CandidateSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(() => {
    // Persist sidebar state in localStorage
    try {
      const stored = localStorage.getItem("candidateSidebarOpen");
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const setOpen = useCallback((nextOpen: boolean) => {
    setOpenState(nextOpen);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("candidateSidebarOpen", JSON.stringify(open));
    } catch {
      console.warn("Could not persist sidebar state");
    }
  }, [open]);

  const value = useMemo(
    () => ({ open, setOpen }),
    [open, setOpen],
  );

  return (
    <CandidateSidebarContext.Provider value={value}>
      {children}
    </CandidateSidebarContext.Provider>
  );
}

export function useCandidateSidebar() {
  const context = useContext(CandidateSidebarContext);
  if (!context) {
    throw new Error("useCandidateSidebar must be used within CandidateSidebarProvider");
  }
  return context;
}
