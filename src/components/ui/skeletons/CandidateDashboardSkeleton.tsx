import { Skeleton } from "./Skeleton";

/**
 * CandidateDashboardSkeleton
 * Skeleton spécifique au dashboard candidat.
 * Reproduit: Welcome card + Stats + Profile completion + Quick actions + Recent offers
 */
export function CandidateDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton variant="line" height={32} className="w-64" />
            <Skeleton variant="line" height={20} className="w-full max-w-md" />
          </div>
          <div className="hidden md:block">
            <Skeleton variant="circle" width={96} height={96} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Skeleton variant="line" height={16} className="w-24" />
            <Skeleton variant="rectangle" height={28} className="w-full" />
          </div>
        ))}
      </div>

      {/* Profile Completion Card */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton variant="line" height={24} className="w-48" />
            <Skeleton variant="line" height={16} className="w-64" />
          </div>
          <Skeleton variant="rectangle" height={40} width={80} />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <Skeleton variant="line" height={16} className="w-24" />
              <Skeleton variant="line" height={14} className="w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <Skeleton variant="line" height={28} className="w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4 h-40">
              <div className="flex justify-center">
                <Skeleton variant="circle" width={48} height={48} />
              </div>
              <Skeleton variant="line" height={18} className="w-32 mx-auto" />
              <Skeleton variant="line" height={14} className="w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Offers */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton variant="line" height={24} className="w-48" />
            <Skeleton variant="line" height={16} className="w-64" />
          </div>
          <Skeleton variant="rectangle" height={36} width={150} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-dashed border-border p-4 space-y-3">
              <Skeleton variant="line" height={20} className="w-48" />
              <Skeleton variant="line" height={16} className="w-full" />
              <div className="flex gap-2">
                <Skeleton variant="rectangle" height={32} width={100} />
                <Skeleton variant="rectangle" height={32} width={100} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
