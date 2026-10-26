import type { ReactNode } from "react";

interface DashboardSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  borderTop?: boolean;
}

export function DashboardSection({
  eyebrow,
  title,
  description,
  children,
  className,
  borderTop = true,
}: DashboardSectionProps) {
  return (
    <section
      className={`min-w-0 ${borderTop ? "border-t border-border" : ""} py-9 sm:py-10 ${className ?? ""}`}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
