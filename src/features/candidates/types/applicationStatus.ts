import type { Database } from "@/integrations/supabase/types";

export type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export const applicationStatusConfig = {
  submitted: {
    label: "Envoyée",
    color: "text-primary",
    icon: "PaperPlaneTilt",
  },
  reviewed: {
    label: "Consultée",
    color: "text-cyan-700 dark:text-cyan-300",
    icon: "Eye",
  },
  shortlisted: {
    label: "Présélectionnée",
    color: "text-violet-700 dark:text-violet-300",
    icon: "Star",
  },
  rejected: {
    label: "Refusée",
    color: "text-muted-foreground",
    icon: "XCircle",
  },
  accepted: {
    label: "Acceptée",
    color: "text-emerald-700 dark:text-emerald-300",
    icon: "CheckCircle",
  },
  withdrawn: {
    label: "Retirée",
    color: "text-muted-foreground",
    icon: "ArrowUUpLeft",
  },
} as const satisfies Record<ApplicationStatus, { label: string; color: string; icon: string }>;

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return Object.hasOwn(applicationStatusConfig, value);
}
