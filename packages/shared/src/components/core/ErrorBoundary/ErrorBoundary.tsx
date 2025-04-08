import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface ErrorBoundaryProps {
  /** The components that this error boundary wraps */
  children: ReactNode;
  
  /** Custom component to render when an error occurs */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  
  /** Callback that will be called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Test ID for testing */
  testID?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, testID = 'error-boundary' } = this.props;

    if (hasError && error) {
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      return <DefaultErrorFallback error={error} resetError={this.resetError} testID={testID} />;
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
  testID?: string;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ 
  error, 
  resetError,
  testID = 'error-fallback',
}) => {
  const { colors } = useTheme();
  
  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background }]} 
      testID={testID}
    >
      <Text style={[styles.title, { color: colors.error }]} testID={`${testID}-title`}>
        Something went wrong
      </Text>
      
      <ScrollView style={styles.errorContainer} testID={`${testID}-details`}>
        <Text style={[styles.errorMessage, { color: colors.text }]}>
          {error.message}
        </Text>
        {error.stack && (
          <Text style={[styles.errorStack, { color: `${colors.text}99` }]}>
            {error.stack}
          </Text>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={resetError}
        testID={`${testID}-reset-button`}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorContainer: {
    maxHeight: 300,
    width: '100%',
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 