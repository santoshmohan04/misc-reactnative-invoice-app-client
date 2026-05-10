import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Sentry } from '../observability/sentry';
import { logger } from '../logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  retryCount: number;
  message: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    retryCount: 0,
    message: 'Something went wrong. Please try again.',
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const isNetworkError = /network|timeout|offline/i.test(error.message);
    return {
      hasError: true,
      message: isNetworkError
        ? 'You appear to be offline. Check your connection and retry.'
        : 'Something went wrong. Please try again.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('Unhandled UI crash captured by ErrorBoundary', 'ui_crash', {
      message: error.message,
      componentStack: errorInfo.componentStack,
    });

    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        boundary: 'global',
      },
    });
  }

  private handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      retryCount: prev.retryCount + 1,
      message: 'Something went wrong. Please try again.',
    }));

    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>We hit a snag</Text>
          <Text style={styles.message}>{this.state.message}</Text>
          <Pressable style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  card: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ErrorBoundary;
