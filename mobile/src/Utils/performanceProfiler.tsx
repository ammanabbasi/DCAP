import React, {useEffect} from 'react';
import {performance, PerformanceMark, PerformanceEntry} from 'perf_hooks';
import {AppState, AppStateStatus} from 'react-native';
import {logger} from './logger';

interface PerformanceMetrics {
  startupTime?: number;
  screenTransitionTime?: number;
  apiResponseTime?: number;
  memoryUsage?: number;
  bundleSize?: number;
  frameRate?: number;
  interactionLatency?: number;
}

class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private startTime: number;
  private memoryInterval?: NodeJS.Timeout;

  constructor() {
    this.startTime = Date.now();
    this.setupPerformanceObservers();
    this.startMemoryMonitoring();
    this.setupAppStateListener();
  }

  static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler();
    }
    return PerformanceProfiler.instance;
  }

  // Mobile-specific performance monitoring
  private setupPerformanceObservers() {
    try {
      // Monitor navigation performance
      if (typeof PerformanceObserver !== 'undefined') {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.metrics.startupTime = entry.duration;
            }
          });
        });

        navigationObserver.observe({entryTypes: ['navigation']});
        this.observers.push(navigationObserver);

        // Monitor measure performance
        const measureObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name.includes('screen-transition')) {
              this.metrics.screenTransitionTime = entry.duration;
            } else if (entry.name.includes('api-call')) {
              this.metrics.apiResponseTime = entry.duration;
            }
          });
        });

        measureObserver.observe({entryTypes: ['measure']});
        this.observers.push(measureObserver);
      }
    } catch (error) {
      logger.warn('Performance observers not supported', error);
    }
  }

  private startMemoryMonitoring() {
    this.memoryInterval = setInterval(() => {
      if (global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
        
        // Alert if memory usage exceeds 200MB
        if (this.metrics.memoryUsage > 200) {
          logger.warn('High memory usage detected:', this.metrics.memoryUsage, 'MB');
          this.reportPerformanceIssue('high_memory_usage', {
            memoryUsage: this.metrics.memoryUsage,
            timestamp: Date.now(),
          });
        }
      }
    }, 10000); // Every 10 seconds
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.markPerformance('app-resume');
      } else if (nextAppState === 'background') {
        this.markPerformance('app-background');
        this.reportMetrics();
      }
    });
  }

  // Performance marking methods
  markPerformance(name: string) {
    try {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(name);
      }
    } catch (error) {
      logger.warn('Performance mark failed:', error);
    }
  }

  measurePerformance(name: string, startMark: string, endMark?: string) {
    try {
      if (typeof performance !== 'undefined' && performance.measure) {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
      }
    } catch (error) {
      logger.warn('Performance measure failed:', error);
    }
  }

  // Screen transition monitoring
  startScreenTransition(screenName: string) {
    this.markPerformance(`screen-transition-start-${screenName}`);
  }

  endScreenTransition(screenName: string) {
    this.markPerformance(`screen-transition-end-${screenName}`);
    this.measurePerformance(
      `screen-transition-${screenName}`,
      `screen-transition-start-${screenName}`,
      `screen-transition-end-${screenName}`
    );
  }

  // API call monitoring
  startApiCall(endpoint: string) {
    this.markPerformance(`api-call-start-${endpoint}`);
  }

  endApiCall(endpoint: string, success: boolean) {
    this.markPerformance(`api-call-end-${endpoint}`);
    this.measurePerformance(
      `api-call-${endpoint}`,
      `api-call-start-${endpoint}`,
      `api-call-end-${endpoint}`
    );
    
    if (!success) {
      this.reportPerformanceIssue('api_call_failed', {
        endpoint,
        timestamp: Date.now(),
      });
    }
  }

  // Component render monitoring
  trackComponentRender(componentName: string, renderTime: number) {
    if (renderTime > 16.67) { // 60fps = 16.67ms per frame
      logger.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
      this.reportPerformanceIssue('slow_component_render', {
        componentName,
        renderTime,
        timestamp: Date.now(),
      });
    }
  }

  // Bundle size monitoring
  setBundleSize(size: number) {
    this.metrics.bundleSize = size / (1024 * 1024); // MB
    logger.info(`Bundle size: ${this.metrics.bundleSize.toFixed(2)}MB`);
    
    if (this.metrics.bundleSize > 10) { // Alert if bundle > 10MB
      this.reportPerformanceIssue('large_bundle_size', {
        bundleSize: this.metrics.bundleSize,
        timestamp: Date.now(),
      });
    }
  }

  // Frame rate monitoring
  trackFrameRate(fps: number) {
    this.metrics.frameRate = fps;
    
    if (fps < 45) { // Alert if FPS drops below 45
      logger.warn(`Low frame rate detected: ${fps}fps`);
      this.reportPerformanceIssue('low_frame_rate', {
        frameRate: fps,
        timestamp: Date.now(),
      });
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      startupTime: this.metrics.startupTime || (Date.now() - this.startTime),
    };
  }

  // Report performance issues
  private reportPerformanceIssue(type: string, data: any) {
    logger.warn(`Performance issue: ${type}`, data);
    
    // In production, send to analytics service
    if (__DEV__ === false) {
      // Send to your analytics service
      // Analytics.track('performance_issue', { type, ...data });
    }
  }

  // Generate performance report
  reportMetrics() {
    const metrics = this.getMetrics();
    logger.info('Performance Metrics:', metrics);
    
    // Performance score calculation
    let score = 100;
    
    if (metrics.startupTime && metrics.startupTime > 3000) score -= 20;
    if (metrics.screenTransitionTime && metrics.screenTransitionTime > 300) score -= 15;
    if (metrics.apiResponseTime && metrics.apiResponseTime > 200) score -= 15;
    if (metrics.memoryUsage && metrics.memoryUsage > 200) score -= 20;
    if (metrics.bundleSize && metrics.bundleSize > 10) score -= 15;
    if (metrics.frameRate && metrics.frameRate < 45) score -= 15;
    
    logger.info(`Performance Score: ${Math.max(score, 0)}/100`);
    
    return {
      ...metrics,
      score: Math.max(score, 0),
      timestamp: Date.now(),
    };
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }
}

// React Hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const profiler = PerformanceProfiler.getInstance();

  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const renderTime = Date.now() - startTime;
      profiler.trackComponentRender(componentName, renderTime);
    };
  }, [componentName, profiler]);

  return profiler;
};

// HOC for performance monitoring
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const WithPerformanceMonitor = (props: P) => {
    const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
    usePerformanceMonitor(displayName);
    
    return <WrappedComponent {...props} />;
  };

  WithPerformanceMonitor.displayName = `withPerformanceMonitor(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithPerformanceMonitor;
};

// Singleton instance
export const performanceProfiler = PerformanceProfiler.getInstance();

export default PerformanceProfiler;