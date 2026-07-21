import { Skeleton } from "./Skeleton";

export function JobOfferDetailSkeleton() {
  return (
    <div className="container-page pb-20 md:pb-28">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-border bg-card p-8 shadow-soft space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <Skeleton variant="line" height={24} className="w-40" />
                <Skeleton variant="line" height={40} className="w-3/4" />
                <Skeleton variant="line" height={16} className="w-1/2" />
              </div>
              <Skeleton variant="circle" width={88} height={88} />
            </div>
            <Skeleton variant="rectangle" height={220} className="w-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm"
              >
                <Skeleton variant="line" height={16} className="w-32" />
                <Skeleton variant="line" height={20} className="w-2/3 mt-4" />
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-border/70 bg-card p-8 shadow-soft space-y-4">
            <Skeleton variant="line" height={24} className="w-48" />
            <Skeleton variant="rectangle" height={180} className="w-full" />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-border/70 bg-card p-7 shadow-soft space-y-4">
            <Skeleton variant="line" height={24} className="w-40" />
            <Skeleton variant="line" height={16} className="w-full" />
            <Skeleton variant="rectangle" height={160} className="w-full" />
          </div>

          <div className="rounded-[28px] border border-border/70 bg-card p-7 shadow-soft space-y-4">
            <Skeleton variant="line" height={24} className="w-40" />
            <Skeleton variant="rectangle" height={110} className="w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
