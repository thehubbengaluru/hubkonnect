import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
          <div className="border-2 border-foreground bg-background shadow-brutal-lg p-8 md:p-12 max-w-md w-full text-center space-y-6">
            <div className="inline-flex h-16 w-16 border-2 border-foreground bg-accent items-center justify-center mx-auto shadow-brutal-sm">
              <span className="font-heading text-3xl">!</span>
            </div>
            <h1 className="font-heading text-2xl uppercase">Something went wrong</h1>
            <p className="font-mono text-sm text-muted-foreground">
              An unexpected error occurred. Please reload the page and try again.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full h-12 border-2 border-foreground bg-foreground text-primary-foreground font-mono font-bold uppercase tracking-wider text-sm shadow-brutal hover:shadow-brutal-hover transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
