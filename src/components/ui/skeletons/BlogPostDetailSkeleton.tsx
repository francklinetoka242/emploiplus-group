import { Skeleton } from "./Skeleton";

export function BlogPostDetailSkeleton() {
  return (
    <div className="bg-[#eef4ff] px-4 pb-16 pt-2 sm:px-6 md:pb-24">
      <div className="container-page grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <main className="order-1 min-w-0 space-y-6 lg:order-1">
          <div className="relative min-h-[300px] overflow-hidden rounded-xl bg-brand-deep shadow-sm sm:min-h-[380px]">
            <Skeleton variant="rectangle" height={380} className="h-full w-full bg-white/10" />
            <div className="absolute bottom-0 left-0 space-y-3 p-5 sm:p-8">
              <Skeleton variant="line" height={32} className="w-[min(520px,75vw)] bg-white/30" />
              <Skeleton variant="line" height={32} className="w-[min(400px,60vw)] bg-white/30" />
              <Skeleton variant="line" height={14} className="w-32 bg-white/20" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton variant="line" height={18} className="w-40" />
          </div>
          <div className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm sm:p-7">
            <Skeleton variant="line" height={18} className="w-full" />
            <Skeleton variant="line" height={18} className="mt-3 w-5/6" />
          </div>
          <article className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-primary/10 pb-4">
              <Skeleton variant="rectangle" height={32} className="w-1 bg-secondary/40" />
              <Skeleton variant="line" height={26} className="w-48" />
            </div>
            <div className="space-y-4">
              <Skeleton variant="line" height={18} className="w-full" />
              <Skeleton variant="line" height={18} className="w-11/12" />
              <Skeleton variant="line" height={18} className="w-4/5" />
              <Skeleton variant="line" height={18} className="mt-8 w-2/5" />
              <Skeleton variant="line" height={18} className="w-full" />
              <Skeleton variant="line" height={18} className="w-3/4" />
            </div>
          </article>
        </main>
        <aside className="order-2 min-w-0 space-y-4 lg:order-2">
          <div className="rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-primary/20">
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
          <div className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm">
            <Skeleton variant="line" height={14} className="w-32" />
            <div className="mt-5 space-y-4">
              <Skeleton variant="line" height={16} className="w-4/5" />
              <Skeleton variant="line" height={16} className="w-3/5" />
            </div>
          </div>
          <div className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm">
            <Skeleton variant="line" height={16} className="w-36" />
            <Skeleton variant="rectangle" height={36} className="mt-4 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
