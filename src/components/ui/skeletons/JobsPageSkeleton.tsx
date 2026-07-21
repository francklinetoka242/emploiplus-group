import { JobCardSkeleton } from "@/features/jobs/components";
import { Skeleton } from "./Skeleton";

export function JobsPageSkeleton() {
  return (
    <div className="container-page pb-20 md:pb-28">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-soft">
            <Skeleton variant="line" height={28} className="w-48" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-border/60 bg-background/70 p-4"
                >
                  <Skeleton variant="line" height={16} className="w-1/2" />
                  <Skeleton variant="line" height={16} className="w-3/4 mt-3" />
                  <Skeleton variant="rectangle" height={96} className="w-full mt-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-soft">
            <Skeleton variant="line" height={24} className="w-40" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="line" height={16} className="w-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
