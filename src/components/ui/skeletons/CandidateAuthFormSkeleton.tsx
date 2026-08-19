import { Skeleton } from "./Skeleton";

export function CandidateAuthFormSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 w-full items-center border-b border-border px-4 sm:px-6">
        <Skeleton variant="rectangle" height={36} width={36} className="rounded-lg" />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-lg border border-border bg-card shadow-xl">
            <div className="space-y-3 px-8 py-6">
              <Skeleton variant="line" height={24} className="mx-auto w-40" />
              <Skeleton variant="line" height={16} className="mx-auto w-72 max-w-full" />
            </div>
            <div className="space-y-5 px-6 pb-6 sm:px-8">
              <Skeleton variant="line" height={42} className="w-full" />
              <Skeleton variant="line" height={42} className="w-full" />
              <Skeleton variant="rectangle" height={42} className="mx-auto w-40" />
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full px-3 py-4 sm:px-6">
        <div className="flex w-full items-center justify-between gap-2">
          <Skeleton variant="line" height={12} className="w-28" />
          <Skeleton variant="line" height={12} className="w-24" />
          <Skeleton variant="line" height={12} className="w-32" />
          <Skeleton variant="line" height={12} className="w-20" />
          <Skeleton variant="line" height={12} className="w-24" />
        </div>
      </footer>
    </div>
  );
}
