import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AdminDashboardChartsProps {
  activeJobs: number;
  publishedPosts: number;
  featuredPosts: number;
  receivedRequests: number;
  activeAdmins: number;
  totalAdmins: number;
}

export function AdminDashboardCharts({
  activeJobs,
  publishedPosts,
  featuredPosts,
  receivedRequests,
  activeAdmins,
  totalAdmins,
}: AdminDashboardChartsProps) {
  const activityData = [
    { category: "Offres", current: activeJobs, reference: Math.max(activeJobs, 10) },
    { category: "Articles", current: publishedPosts, reference: Math.max(publishedPosts, 10) },
    { category: "À la une", current: featuredPosts, reference: Math.max(featuredPosts, 10) },
    { category: "Demandes", current: receivedRequests, reference: Math.max(receivedRequests, 10) },
  ];
  const activeAdminRate = totalAdmins > 0 ? Math.round((activeAdmins / totalAdmins) * 100) : 0;
  const publicationRate = publishedPosts > 0 ? Math.round((featuredPosts / publishedPosts) * 100) : 0;
  const radialData = [
    { name: "Opérationnel", value: Math.min(100, Math.max(0, activeJobs + publishedPosts)), fill: "var(--primary)" },
    { name: "Admins actifs", value: activeAdminRate, fill: "var(--secondary)" },
    { name: "À la une", value: publicationRate, fill: "var(--success)" },
  ];

  return (
    <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-[1.35rem] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Activité</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Comparatif des indicateurs</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Actuel / repère</span>
        </div>
        <div className="mt-4 h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="admin-current-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="admin-reference-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", color: "var(--foreground)" }}
              />
              <Legend />
              <Area type="monotone" dataKey="current" name="Actuel" stroke="var(--primary)" fill="url(#admin-current-area)" strokeWidth={2} />
              <Area type="monotone" dataKey="reference" name="Repère" stroke="var(--secondary)" fill="url(#admin-reference-area)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-[1.35rem] sm:p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Répartition</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Vue radiale</h3>
        </div>
        <div className="mt-2 h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="46%"
              innerRadius="28%"
              outerRadius="82%"
              barSize={12}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "var(--muted)" }} dataKey="value" cornerRadius={8} />
              <Tooltip
                formatter={(value: number | undefined) => [`${value ?? 0}%`, "Valeur"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", color: "var(--foreground)" }}
              />
              <Legend iconType="circle" layout="vertical" verticalAlign="bottom" align="center" />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
