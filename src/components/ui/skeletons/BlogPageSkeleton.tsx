import { Skeleton } from "./Skeleton";

export function BlogPageSkeleton() {
  return (
    <div className="container-page pb-20 md:pb-28">
      <div className="space-y-8">
        <div className="rounded-[32px] border border-border bg-card p-8 shadow-soft">
          <Skeleton variant="line" height={36} className="w-3/5" />
          <Skeleton variant="line" height={16} className="w-1/3 mt-4" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4"
            >
              <Skeleton variant="line" height={24} className="w-2/3" />
              <Skeleton variant="line" height={16} className="w-1/2" />
              <Skeleton variant="rectangle" height={140} className="w-full" />
              <Skeleton variant="line" height={16} className="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
