import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardIcon, type DashboardIconName } from "./DashboardIcon";

interface DashboardSectionProps {
  title: string;
  description?: string;
  icon: DashboardIconName;
  children: ReactNode;
  className?: string;
}

const iconTone: Partial<Record<DashboardIconName, string>> = {
  PaperPlaneTilt: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  CalendarDots: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  Briefcase: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  ChatCircleDots: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

export function DashboardSection({
  title,
  description,
  icon,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <Card className={`rounded-2xl border-border/70 shadow-none ${className ?? ""}`}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-5 sm:p-6">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            iconTone[icon] ?? "bg-primary/10 text-primary"
          }`}
        >
          <DashboardIcon name={icon} size={22} />
        </span>
        <span className="min-w-0">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </span>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">{children}</CardContent>
    </Card>
  );
}
