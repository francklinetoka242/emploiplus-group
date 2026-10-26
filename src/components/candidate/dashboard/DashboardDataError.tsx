interface DashboardDataErrorProps {
  message: string;
  onRetry: () => void;
}

export function DashboardDataError({ message, onRetry }: DashboardDataErrorProps) {
  return (
    <div className="py-3 text-sm text-destructive" role="alert">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 font-semibold underline underline-offset-4"
      >
        Réessayer
      </button>
    </div>
  );
}
