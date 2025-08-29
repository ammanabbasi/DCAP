import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Colors } from '../../Theme/Colors';
import { hp, rfs, wp } from '../../Theme/Responsiveness';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 600;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to your error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call parent error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Send error to crash reporting service (e.g., Sentry, Bugsnag)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        platform: Platform.OS,
        version: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        deviceId: DeviceInfo.getDeviceId(),
        systemVersion: DeviceInfo.getSystemVersion(),
        timestamp: new Date().toISOString(),
      };

      // TODO: Send to your error reporting service
      console.log('Error data to be sent:', errorData);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorMessage}>
                We're sorry for the inconvenience. The app encountered an unexpected error.
              </Text>

              {__DEV__ && this.state.error && (
                <View style={styles.debugInfo}>
                  <Text style={styles.debugTitle}>Debug Information:</Text>
                  <Text style={styles.debugText}>
                    {this.state.error.message}
                  </Text>
                  {this.state.error.stack && (
                    <ScrollView
                      style={styles.stackTrace}
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      <Text style={styles.stackText}>
                        {this.state.error.stack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={this.handleReset}
                  activeOpacity={0.8}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.helpText}>
                If this problem persists, please contact support or try restarting the app.
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: wp(3),
    padding: wp(5),
    width: '100%',
    maxWidth: isTablet ? wp(60) : wp(90),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: rfs(24),
    fontWeight: 'bold',
    color: Colors.primary || '#333',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  errorMessage: {
    fontSize: rfs(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: rfs(22),
  },
  debugInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(3),
  },
  debugTitle: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(1),
  },
  debugText: {
    fontSize: rfs(12),
    color: '#666',
    marginBottom: hp(1),
  },
  stackTrace: {
    maxHeight: hp(15),
    backgroundColor: '#fff',
    borderRadius: wp(1),
    padding: wp(2),
  },
  stackText: {
    fontSize: rfs(10),
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: Colors.primary || '#007AFF',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
    minWidth: wp(40),
  },
  retryButtonText: {
    color: 'white',
    fontSize: rfs(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  helpText: {
    fontSize: rfs(12),
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;