import React from "react";
import { cn } from "@/lib/utils";

interface SaasContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive container avec marges cohérentes :
 * Mobile: 16px, Tablet: 24px, Desktop: 32px
 */
export function SaasContainer({ children, className }: SaasContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

interface SaasGridProps {
  children: React.ReactNode;
  columns?: "1" | "2" | "3" | "4";
  gap?: "3" | "4" | "6" | "8";
}

/**
 * Grille responsive moderne
 * Desktop: 3 colonnes par défaut
 * Tablet: 2 colonnes
 * Mobile: 1 colonne
 */
export function SaasGrid({ children, columns = "3", gap = "6" }: SaasGridProps) {
  const gridClasses = {
    "1": "grid-cols-1",
    "2": "md:grid-cols-2 grid-cols-1",
    "3": "lg:grid-cols-3 md:grid-cols-2 grid-cols-1",
    "4": "lg:grid-cols-4 md:grid-cols-2 grid-cols-1",
  };

  const gapClasses = {
    "3": "gap-3",
    "4": "gap-4",
    "6": "gap-6",
    "8": "gap-8",
  };

  return <div className={cn("grid", gridClasses[columns], gapClasses[gap])}>{children}</div>;
}

interface SaasPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function SaasPageHeader({ title, subtitle, action, icon }: SaasPageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 text-primary">{icon}</div>}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
