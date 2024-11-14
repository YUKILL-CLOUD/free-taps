'use client';

import { Component, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-semibold">Something went wrong</h2>
          </div>
          <p className="text-red-600 mb-4">{this.state.error?.message}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
