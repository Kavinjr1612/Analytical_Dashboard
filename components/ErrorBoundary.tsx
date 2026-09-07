'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] px-4 text-center">
          <div className="glass-panel max-w-md p-8 text-center flex flex-col items-center border border-danger/30">
            <div className="rounded-full bg-danger/10 p-4 mb-4 text-danger animate-pulse">
              <AlertTriangle size={48} />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-text-muted text-sm mb-6">
              The Sales Analytics Dashboard encountered an unexpected error. This has been logged and we recommend refreshing the interface.
            </p>
            
            {this.state.error && (
              <div className="w-full text-left bg-black/40 border border-white/5 rounded-lg p-3 mb-6 font-mono text-xs text-danger overflow-auto max-h-40">
                {this.state.error.stack || this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-blue px-4 py-2.5 font-semibold text-white transition hover:bg-accent-blue/80 active:scale-95"
            >
              <RefreshCw size={18} />
              Reset Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
