import * as Sentry from '@sentry/react-native';
import { environment } from './environment';

// Initialize Sentry with environment-specific configuration
export const initSentry = () => {
  if (environment.sentry.enabled) {
    Sentry.init({
      dsn: environment.sentry.dsn,
      environment: environment.name,
      tracesSampleRate: environment.sentry.tracesSampleRate,
      enableNative: true,
      enableNativeNagger: false,
      enableAutoPerformanceTracking: true,
      enableOutOfMemoryTracking: true,
      attachStacktrace: true,
      // Only enable profiling in development
      enableAutoSessionTracking: environment.name === 'development',
      // Configure release
      release: `vici-mobile@${process.env.npm_package_version}`,
      // Configure beforeSend to filter sensitive data
      beforeSend(event) {
        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data) {
              // Remove sensitive data from breadcrumbs
              const { password, token, ...safeData } = breadcrumb.data;
              return {
                ...breadcrumb,
                data: safeData,
              };
            }
            return breadcrumb;
          });
        }
        return event;
      },
    });

    // Set user context when available
    const setUserContext = (user: any) => {
      if (user) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.username,
        });
      }
    };

    // Set tags for better error grouping
    Sentry.setTag('app_version', process.env.npm_package_version);
    Sentry.setTag('platform', 'react-native');

    return {
      setUserContext,
    };
  }

  return {
    setUserContext: () => {},
  };
};

// Export Sentry instance for direct use if needed
export { Sentry }; 