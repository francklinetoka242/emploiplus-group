export function CandidateLoadingIndicator() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="flex flex-col items-center gap-4 text-center"
        role="status"
        aria-live="polite"
        aria-label="Chargement en cours"
      >
        <img src="/Logo.png" alt="" className="size-14 rounded-xl object-cover" />
        <div className="candidate-loading-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
