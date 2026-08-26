import { Skeleton } from "./Skeleton";

export function BlogPageSkeleton() {
  return (
    <div className="bg-[#eef4ff] py-5 sm:py-8">
      <div className="container-page max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="line" height={12} className="w-28" />
            <Skeleton variant="line" height={40} className="w-64" />
          </div>
          <Skeleton variant="line" height={18} className="hidden w-64 sm:block" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-brand-deep shadow-sm sm:min-h-[340px]">
            <Skeleton variant="rectangle" height={340} className="h-full w-full bg-white/10" />
            <div className="absolute bottom-0 left-0 space-y-3 p-5 sm:p-7">
              <Skeleton variant="line" height={30} className="w-[min(520px,70vw)] bg-white/30" />
              <Skeleton variant="line" height={30} className="w-[min(400px,60vw)] bg-white/30" />
              <Skeleton variant="line" height={14} className="w-28 bg-white/20" />
            </div>
          </div>
          <div className="rounded-xl bg-white/70 p-4 shadow-sm ring-1 ring-primary/20">
            <Skeleton variant="line" height={22} className="w-40" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 border-b border-primary/10 pb-3 last:border-0">
                  <Skeleton variant="rectangle" height={48} className="w-14 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="line" height={12} className="w-full" />
                    <Skeleton variant="line" height={10} className="w-2/3" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton variant="line" height={16} className="mt-4 w-24" />
          </div>
        </div>
      </div>
      <div className="relative bg-background pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="container-page">
          <Skeleton variant="line" height={16} className="w-28" />
          <Skeleton variant="line" height={34} className="mt-4 w-72" />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden border-b border-border pb-6">
                <Skeleton variant="rectangle" height={192} className="w-full" />
                <div className="space-y-3 p-6">
                  <Skeleton variant="line" height={14} className="w-2/5" />
                  <Skeleton variant="line" height={22} className="w-4/5" />
                  <Skeleton variant="line" height={16} className="w-full" />
                  <Skeleton variant="line" height={16} className="w-3/4" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton variant="rectangle" height={58} className="mt-12 w-full" />
        </div>
      </div>
    </div>
  );
}
