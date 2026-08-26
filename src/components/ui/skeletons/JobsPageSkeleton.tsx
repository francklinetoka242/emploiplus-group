import { JobCardSkeleton } from "@/features/jobs/components";
import { Skeleton } from "./Skeleton";

export function JobsPageSkeleton() {
  return (
    <div className="container-page pb-32 md:pb-28">
      <div className="grid gap-6">
        <div className="rounded-[1.25rem] border border-border bg-card/95 p-3 shadow-soft sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton variant="line" height={20} className="w-40" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton variant="line" height={44} className="flex-1 rounded-xl" />
            <Skeleton variant="line" height={44} width={44} className="rounded-xl" />
            <Skeleton variant="line" height={44} width={44} className="rounded-xl" />
            <Skeleton variant="line" height={44} width={44} className="rounded-xl" />
          </div>

          <div className="mt-3 flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="line"
                height={32}
                className="w-24 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 pt-2">
          <Skeleton variant="line" height={28} className="w-44" />
          <Skeleton variant="line" height={16} className="w-24" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
