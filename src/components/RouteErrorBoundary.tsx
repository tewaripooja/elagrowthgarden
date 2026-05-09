import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

/** Catches render errors so the app does not go fully blank without explanation. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || "Unknown error" };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("Route error:", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-violet-950/90 to-slate-900 text-cyan-50">
          <div className="max-w-lg rounded-2xl border border-white/20 bg-card/95 p-8 shadow-xl space-y-3">
            <h1 className="font-heading text-2xl text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground font-body">
              The page hit an error while rendering. Open the browser developer console (F12 → Console) for the full
              stack trace.
            </p>
            <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-auto text-destructive whitespace-pre-wrap">
              {this.state.message}
            </pre>
            <button
              type="button"
              className="mt-2 rounded-xl bg-primary px-4 py-2 text-primary-foreground font-heading text-sm"
              onClick={() => window.location.assign("/")}
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
