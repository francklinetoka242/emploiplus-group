import React from "react";
import { cn } from "@/lib/utils";

interface SaasCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
}

export function SaasCard({
  children,
  className,
  hoverable = false,
  gradient = false,
}: SaasCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white/60 backdrop-blur-sm transition-all duration-300",
        "border-slate-200/50",
        gradient && "border-slate-200/30 bg-gradient-to-br from-white/80 to-slate-50/80",
        hoverable && "hover:border-slate-300/70 hover:shadow-lg hover:bg-white/80",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SaasCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function SaasCardHeader({ title, subtitle, action, icon }: SaasCardHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100/50 px-6 py-4">
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 text-slate-600">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface SaasCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SaasCardContent({ children, className }: SaasCardContentProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

interface SaasCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SaasCardFooter({ children, className }: SaasCardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-slate-100/50 px-6 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
