import React, { createContext, useContext, useState, useEffect } from 'react';

interface CandidateSidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CandidateSidebarContext = createContext<CandidateSidebarContextType | undefined>(undefined);

export function CandidateSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(() => {
    // Persist sidebar state in localStorage
    try {
      const stored = localStorage.getItem('candidateSidebarOpen');
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('candidateSidebarOpen', JSON.stringify(open));
    } catch {
      console.warn('Could not persist sidebar state');
    }
  }, [open]);

  return (
    <CandidateSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </CandidateSidebarContext.Provider>
  );
}

export function useCandidateSidebar() {
  const context = useContext(CandidateSidebarContext);
  if (!context) {
    throw new Error('useCandidateSidebar must be used within CandidateSidebarProvider');
  }
  return context;
}
