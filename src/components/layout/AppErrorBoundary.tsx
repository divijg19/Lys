"use client";
import React from "react";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}
interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/** Lightweight production error boundary (logs to console, shows minimal UI) */
export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[AppErrorBoundary]", error, info.componentStack);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-12 max-w-lg rounded-md border border-destructive/40 bg-destructive/5 p-6 text-sm">
          <h2 className="mb-2 font-semibold text-destructive">Something went wrong.</h2>
          <p className="text-muted-foreground">
            An unexpected error occurred while rendering this section.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
