import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <Skeleton className="aspect-[16/8] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
