import { format, startOfWeek, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import type { CandidateApplicationActivity } from "@/features/candidates/api/applicationsApi";
import { applicationStatusConfig, type ApplicationStatus } from "../types/applicationStatus.ts";

export interface WeeklyApplicationActivity {
  weekStart: Date;
  label: string;
  count: number;
}

export function countApplicationsByStatus(
  applications: CandidateApplicationActivity[],
): Record<ApplicationStatus, number> {
  const counts = Object.fromEntries(
    Object.keys(applicationStatusConfig).map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;

  for (const application of applications) {
    counts[application.status] += 1;
  }

  return counts;
}

export function groupApplicationsByWeek(
  applications: CandidateApplicationActivity[],
  now = new Date(),
): WeeklyApplicationActivity[] {
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const weekStart = subWeeks(currentWeekStart, 7 - index);
    return {
      weekStart,
      label: format(weekStart, "d MMM", { locale: fr }),
      count: 0,
    };
  });
  const oldestWeek = weeks[0]?.weekStart.getTime() ?? currentWeekStart.getTime();
  const nextWeekStart = subWeeks(currentWeekStart, -1).getTime();

  for (const application of applications) {
    const appliedAt = new Date(application.applied_at).getTime();
    if (!Number.isFinite(appliedAt) || appliedAt < oldestWeek || appliedAt >= nextWeekStart) {
      continue;
    }
    const weekStart = startOfWeek(new Date(appliedAt), { weekStartsOn: 1 }).getTime();
    const week = weeks.find((candidateWeek) => candidateWeek.weekStart.getTime() === weekStart);
    if (week) week.count += 1;
  }

  return weeks;
}
