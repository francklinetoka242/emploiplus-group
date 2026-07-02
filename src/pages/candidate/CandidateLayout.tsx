import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { CandidateTopbar } from "@/components/candidate/CandidateTopbar";
import { useCandidate } from "@/hooks/useCandidate";
import { usePageSEO } from "@/lib/seo";

export function CandidateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useCandidate();

  usePageSEO({
    title: "Mon Espace Candidat - EmploiPlus Group",
    description: "Accédez à votre espace candidat sur EmploiPlus Group",
    robots: "noindex,nofollow",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <CandidateSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} onLogout={logout} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <CandidateTopbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
