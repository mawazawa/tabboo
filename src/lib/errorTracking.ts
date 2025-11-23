/**
 * Centralized error tracking and logging service
 * Provides structured logging with levels and external service integration
 */

import * as Sentry from '@sentry/react';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  page?: string;
  action?: string;
  [key: string]: string | number | boolean | undefined | Record<string, unknown>;
}

/**
 * Main error tracking class
 */
class ErrorTracker {
  private isDevelopment = import.meta.env.DEV;
  private sessionId = this.generateSessionId();

  private generateSessionId(): string {
    // Pad with zeros to guarantee 9 characters after slicing
    // This handles edge cases where Math.random() returns very small values
    // that produce short base-36 strings (e.g., 0.0001 -> "0.0")
    const randomPart = (Math.random().toString(36) + '00000000000').slice(2, 11);
    return `${Date.now()}-${randomPart}`;
  }

  /**
   * Log message with context
   */
  log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      sessionId: this.sessionId,
      ...context,
    };

    // Console logging in development
    if (this.isDevelopment) {
      const consoleFn = {
        [LogLevel.DEBUG]: console.debug,
        [LogLevel.INFO]: console.info,
        [LogLevel.WARN]: console.warn,
        [LogLevel.ERROR]: console.error,
      }[level];

      consoleFn(`[${level.toUpperCase()}]`, message, context || '');
    }

    // In production, send to monitoring service
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToMonitoringService(logData);
    }

    // Store in sessionStorage for debugging
    this.storeLog(logData);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, details?: Record<string, string | number | boolean | undefined>) {
    this.info(`User action: ${action}`, {
      action,
      ...details,
    });
  }

  /**
   * Store log in sessionStorage (last 100 logs)
   */
  private storeLog(logData: Record<string, unknown>) {
    try {
      const logs = this.getLogs();
      logs.push(logData);

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }

      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (e) {
      // Silent fail if storage is full
    }
  }

  /**
   * Get stored logs
   */
  getLogs(): Record<string, unknown>[] {
    try {
      const stored = sessionStorage.getItem('app_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    sessionStorage.removeItem('app_logs');
  }

  /**
   * Send to external monitoring service (Sentry)
   */
  private sendToMonitoringService(logData: Record<string, unknown>) {
    // Send to Sentry if configured
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn) {
      const errorData = logData.error as { name?: string; message?: string; stack?: string } | undefined;

      if (errorData?.message) {
        // Capture as exception with full context
        const error = new Error(errorData.message);
        error.name = errorData.name || 'Error';
        if (errorData.stack) {
          error.stack = errorData.stack;
        }

        Sentry.captureException(error, {
          contexts: {
            log: {
              ...logData,
              error: undefined, // Don't duplicate error object
            },
          },
          tags: {
            session_id: this.sessionId,
            action: logData.action as string | undefined,
          },
        });
      } else {
        // Capture as message with context
        Sentry.captureMessage(logData.message as string, {
          level: 'error',
          contexts: { log: logData },
          tags: {
            session_id: this.sessionId,
          },
        });
      }
    }

    // Also log in development for debugging
    if (import.meta.env.DEV) {
      console.log('[MONITORING]', 'Sent to Sentry:', logData);
    }
  }

  /**
   * Download logs as JSON file (for debugging)
   */
  downloadLogs() {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Convenience exports
export const logDebug = (message: string, context?: LogContext) => errorTracker.debug(message, context);
export const logInfo = (message: string, context?: LogContext) => errorTracker.info(message, context);
export const logWarn = (message: string, context?: LogContext) => errorTracker.warn(message, context);
export const logError = (message: string, error?: Error, context?: LogContext) => errorTracker.error(message, error, context);
export const trackAction = (action: string, details?: Record<string, string | number | boolean | undefined>) => errorTracker.trackAction(action, details);
