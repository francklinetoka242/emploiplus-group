import { CandidateDashboardSkeleton } from "@/components/ui/skeletons/CandidateDashboardSkeleton";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";

type CandidateAccountPage =
  | "applications"
  | "dashboard"
  | "documents"
  | "guides"
  | "job-apply"
  | "notifications"
  | "onboarding"
  | "profile"
  | "profile-edit"
  | "saved"
  | "settings"
  | "subscription"
  | "subscription-plan"
  | "cv-editor"
  | "application-detail"
  | "cv-catalog";

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

function CandidatePageSkeletonContent({ page }: { page: CandidateAccountPage }) {
  if (page === "dashboard") return <CandidateDashboardSkeleton />;

  if (page === "applications" || page === "saved") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border p-5">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "profile") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" width={64} height={64} />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-56 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden border-b border-border pb-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-lg" />
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="mb-5 h-6 w-48" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (page === "profile-edit") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    );
  }

  if (page === "documents") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-border p-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="mb-4 h-5 w-52" />
          <SkeletonLines count={3} />
        </div>
      </div>
    );
  }

  if (page === "guides") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-7 w-64 max-w-full" />
          <SkeletonLines count={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="mb-4 h-36 w-full rounded-xl" />
              <Skeleton className="mb-3 h-5 w-3/4" />
              <SkeletonLines count={2} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "subscription") {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-4 h-20 w-full rounded-xl" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-9 w-36" />
              <SkeletonLines count={4} />
              <Skeleton className="mt-6 h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "subscription-plan") {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-48" />
            <SkeletonLines count={3} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-6 w-40" />
            <SkeletonLines count={4} />
            <Skeleton className="mt-6 h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="mb-4 h-10 w-10 rounded-lg" />
              <Skeleton className="mb-3 h-5 w-40" />
              <SkeletonLines count={2} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "cv-catalog") {
    return (
      <div className="space-y-5">
        <div className="max-w-3xl space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="grid max-w-5xl gap-8 py-5 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex h-[170px] items-center justify-center bg-muted p-4">
                <Skeleton className="h-full w-28 rounded-md" />
              </div>
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "cv-editor") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-64 max-w-full" />
        <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-6 w-40" />
            <SkeletonLines count={5} />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-muted/30 p-5">
            <div className="aspect-[210/297] w-full max-w-sm space-y-5 bg-card p-8 shadow-sm">
              <Skeleton className="mx-auto h-8 w-2/3" />
              <Skeleton className="mx-auto h-4 w-1/2" />
              <SkeletonLines count={8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === "notifications") {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap justify-end gap-3">
          <Skeleton className="h-11 w-56 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-border p-4"
            >
              <Skeleton variant="circle" width={20} height={20} />
              <Skeleton variant="circle" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "job-apply") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="flex gap-5">
            <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (page === "settings") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-5 w-44" />
            <SkeletonLines count={3} />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (page === "application-detail") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    );
  }

  if (page === "onboarding") {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-3xl border border-border bg-card p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <SkeletonLines count={3} />
          <SkeletonLines count={3} />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <Skeleton className="min-h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="rounded-2xl border border-border bg-card p-5">
        <SkeletonLines count={5} />
      </div>
    </div>
  );
}

export function CandidateAccountPageSkeleton({ page }: { page: CandidateAccountPage }) {
  return (
    <div role="status" aria-label="Chargement de la page" aria-busy="true">
      <CandidatePageSkeletonContent page={page} />
    </div>
  );
}
