import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console for developer debugging
    // In the future we could send this to an error-tracking service
    // eslint-disable-next-line no-console
    console.error("Uncaught error in UI:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    const message = this.state.error ? this.state.error.message : "Erreur inconnue";

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground">Erreur d'affichage</h3>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-4 flex gap-2">
            <button
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Recharger
            </button>
            <button
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Masquer
            </button>
          </div>
        </div>
      </div>
    );
  }
}
