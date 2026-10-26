import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { groupApplicationsByWeek } from "@/features/candidates/dashboard/applicationActivity";
import type { CandidateApplicationActivity } from "@/features/candidates/api/applicationsApi";
import { DashboardIcon } from "./DashboardIcon";

interface ApplicationsActivityChartProps {
  applications: CandidateApplicationActivity[];
  totalApplications: number | null;
}

export function ApplicationsActivityChart({
  applications,
  totalApplications,
}: ApplicationsActivityChartProps) {
  const reduceMotion = useReducedMotion();
  const { isEcoMode } = useEcoMode();
  const animate = !reduceMotion && !isEcoMode;
  const groupedActivity = groupApplicationsByWeek(applications);
  const weeklyDetails = groupedActivity.map(({ label, count }) => `${label} : ${count}`).join("; ");
  const summary = `${applications.length} candidature${applications.length === 1 ? "" : "s"} sur les huit dernières semaines. ${weeklyDetails}`;

  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Candidatures envoyées par semaine
      </h3>
      <p className="sr-only" role="img" aria-label={summary}>
        {summary}
      </p>
      {applications.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DashboardIcon name="PaperPlaneTilt" size={22} />
          </span>
          <p className="mt-3 max-w-xs text-sm leading-5 text-muted-foreground">
            {totalApplications === null
              ? "L’activité récente est momentanément indisponible."
              : totalApplications > 0
                ? "Aucune candidature envoyée ces 8 dernières semaines."
                : "Votre prochaine opportunité peut commencer ici."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/jobs">Voir les offres</Link>
          </Button>
        </div>
      ) : (
        <div className="h-48 min-w-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={groupedActivity} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="application-activity-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} candidature${value === 1 ? "" : "s"}`, "Envoyées"]}
                labelFormatter={(label) => `Semaine du ${label}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#application-activity-fill)"
                dot={{ r: 3, fill: "var(--primary)" }}
                activeDot={{ r: 5 }}
                isAnimationActive={animate}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
