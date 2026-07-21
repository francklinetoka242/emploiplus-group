import { Skeleton } from "./Skeleton";

/**
 * DashboardLayoutSkeleton
 * Affiche le shell global du dashboard avec une apparence de chargement.
 * Reproduit la structure: Sidebar + Header + Contenu principal
 */
export function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex w-64 bg-card border-r border-border flex-col p-4 gap-4">
        {/* Logo */}
        <Skeleton variant="rectangle" height={40} className="w-32" />

        {/* Navigation items */}
        <div className="space-y-3 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="line" height={32} className="w-full" />
          ))}
        </div>

        {/* Footer skeleton */}
        <Skeleton variant="line" height={32} className="w-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="border-b border-border bg-card h-16 px-6 flex items-center gap-4">
          <div className="flex-1">
            <Skeleton variant="line" height={24} className="w-48" />
          </div>
          <Skeleton variant="circle" width={40} height={40} />
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Page Title */}
          <Skeleton variant="line" height={32} className="w-64" />

          {/* Main cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 space-y-3">
                <Skeleton variant="line" height={20} className="w-24" />
                <Skeleton variant="rectangle" height={40} className="w-full" />
              </div>
            ))}
          </div>

          {/* Content sections */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <Skeleton variant="line" height={24} className="w-48" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="line" height={16} className="w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
