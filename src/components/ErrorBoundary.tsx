import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents entire app from crashing when a component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full border-2 shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" strokeWidth={0.5} />
                </div>
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <CardDescription>
                    We're sorry, but something unexpected happened
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {this.state.error.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40 text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                If this problem persists, please contact support
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
