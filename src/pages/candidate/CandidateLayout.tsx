import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { CandidateTopbar } from "@/components/candidate/CandidateTopbar";
import { useCandidate } from "@/hooks/useCandidate";
import { usePageSEO } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function CandidateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useCandidate();

  usePageSEO({
    title: "Mon Espace Candidat - EmploiPlus Group",
    description: "Accédez à votre espace candidat sur EmploiPlus Group",
    robots: "noindex,nofollow",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative">
        <CandidateSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} onLogout={logout} />

        <div className={cn(
          "ml-0 transition-all duration-300",
          sidebarOpen ? "md:ml-72" : "md:ml-20"
        )}>
          <CandidateTopbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} />

          <main className="min-h-screen overflow-auto bg-slate-50 py-6">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
