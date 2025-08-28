import { CONFIG, Logger } from '../config/buildConfig';

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private memoryWarningThreshold = 150 * 1024 * 1024; // 150MB

  startTimer(name: string): void {
    if (!CONFIG.ENABLE_LOGGING) return;
    
    this?.metrics?.set(name, {
      name,
      startTime: Date.now(),
    });
    Logger.log(`[PERF] Started timer: ${name}`);
  }

  endTimer(name: string): number | null {
    if (!CONFIG.ENABLE_LOGGING) return null;
    
    const metric = this?.metrics?.get(name);
    if (!metric) {
      Logger.warn(`[PERF] Timer not found: ${name}`);
      return null;
    }

    const duration = Date.now() - metric.startTime;
    metric.duration = duration;
    
    Logger.log(`[PERF] ${name}: ${duration}ms`);
    
    // Warn for slow operations (>2 seconds)
    if (duration > 2000) {
      Logger.warn(`[PERF] Slow operation detected: ${name} took ${duration}ms`);
    }
    
    return duration;
  }

  measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    if (!CONFIG.ENABLE_LOGGING) {
      return asyncFn();
    }

    this.startTimer(name);
    return asyncFn()
      .then((result: any) => {
        this.endTimer(name);
        return result;
      })
      .catch((error: any) => {
        this.endTimer(name);
        throw error;
      });
  }

  checkMemoryUsage(): void {
    if (!CONFIG.ENABLE_LOGGING) return;

    // Note: React Native doesn't have direct access to JS heap size
    // This is a placeholder for when using tools like Flipper
    Logger.log('[PERF] Memory usage check - Use Flipper or dev tools for detailed memory profiling');
  }

  logNavigationTiming(screenName: string, startTime: number): void {
    if (!CONFIG.ENABLE_LOGGING) return;
    
    const duration = Date.now() - startTime;
    Logger.log(`[NAV] ${screenName} loaded in ${duration}ms`);
    
    // Warn for slow navigation (>1 second)
    if (duration > 1000) {
      Logger.warn(`[NAV] Slow screen load: ${screenName} took ${duration}ms`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this?.metrics?.values());
  }

  clearMetrics(): void {
    this?.metrics?.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Export HOC for measuring component render time
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
) {
  return React.memo((props: P) => {
    const renderStart = React.useRef<number>(0);
    
    React.useLayoutEffect(() => {
      renderStart.current = Date.now();
    });
    
    React.useEffect(() => {
      const renderTime = Date.now() - renderStart.current;
      if (CONFIG.ENABLE_LOGGING && renderTime > 100) {
        Logger.log(`[RENDER] ${componentName}: ${renderTime}ms`);
      }
    });
    
    return <WrappedComponent {...props} />;
  });
}

export default performanceMonitor;
