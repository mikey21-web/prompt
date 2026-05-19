'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors in dashboard pages so the whole shell doesn't
 * crash. Captured errors are forwarded to the monitoring façade
 * (`@/lib/monitoring`) which logs locally and is ready to forward to Sentry
 * once @sentry/nextjs is installed.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, {
      componentStack: info.componentStack ?? undefined,
      tags: { boundary: 'dashboard' },
    });
    this.props.onError?.(error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    if (this.props.fallback) {
      return this.props.fallback;
    }
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-6"
      >
        <h2 className="text-lg font-semibold text-red-800">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {this.state.error?.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }
}
