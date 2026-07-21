import { Skeleton } from "./Skeleton";

export function PublicPageSkeleton() {
  return (
    <div className="container-page py-20">
      <div className="space-y-10">
        <div className="rounded-[32px] border border-border bg-card p-8 shadow-soft">
          <Skeleton variant="line" height={36} className="w-3/5" />
          <Skeleton variant="line" height={20} className="w-2/5 mt-4" />
          <Skeleton variant="rectangle" height={264} className="w-full mt-8" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <Skeleton variant="line" height={28} className="w-2/3" />
              <Skeleton variant="line" height={16} className="w-1/2 mt-4" />
              <Skeleton variant="rectangle" height={180} className="w-full mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
