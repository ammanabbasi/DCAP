interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
  navigationTiming?: PerformanceNavigationTiming;
  resourceTimings?: PerformanceResourceTiming[];
  memoryUsage?: any;
  bundleSize?: number;
}

interface PerformanceThresholds {
  fcp: number; // Good: < 1.8s
  lcp: number; // Good: < 2.5s
  fid: number; // Good: < 100ms
  cls: number; // Good: < 0.1
  ttfb: number; // Good: < 600ms
  tti: number; // Good: < 3.8s
}

class WebPerformanceMonitor {
  private static instance: WebPerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = {
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
    tti: 3800,
  };

  constructor() {
    this.init();
  }

  static getInstance(): WebPerformanceMonitor {
    if (!WebPerformanceMonitor.instance) {
      WebPerformanceMonitor.instance = new WebPerformanceMonitor();
    }
    return WebPerformanceMonitor.instance;
  }

  private init() {
    // Wait for page load to start monitoring
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupObservers());
    } else {
      this.setupObservers();
    }

    // Monitor navigation timing
    this.collectNavigationTiming();
    
    // Monitor resource timing
    this.collectResourceTiming();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  private setupObservers() {
    // Observe paint metrics (FCP, LCP)
    if ('PerformanceObserver' in window) {
      this.observePaintMetrics();
      this.observeLayoutShift();
      this.observeFirstInputDelay();
      this.observeLargestContentfulPaint();
    }

    // Fallback for browsers without PerformanceObserver
    this.collectFallbackMetrics();
  }

  private observePaintMetrics() {
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.evaluateMetric('fcp', entry.startTime);
          }
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Paint observer not supported:', error);
    }
  }

  private observeLargestContentfulPaint() {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          this.evaluateMetric('lcp', lastEntry.startTime);
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  private observeFirstInputDelay() {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
            this.evaluateMetric('fid', fid);
          }
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }
  }

  private observeLayoutShift() {
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.cls = clsValue;
        this.evaluateMetric('cls', clsValue);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  private collectNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const navTiming = navEntries[0];
        this.metrics.navigationTiming = navTiming;
        
        // Calculate TTFB
        this.metrics.ttfb = navTiming.responseStart - navTiming.fetchStart;
        this.evaluateMetric('ttfb', this.metrics.ttfb);
        
        // Estimate TTI (simplified)
        this.metrics.tti = navTiming.domInteractive - navTiming.fetchStart;
        this.evaluateMetric('tti', this.metrics.tti);
      }
    }
  }

  private collectResourceTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      this.metrics.resourceTimings = resourceEntries;
      
      // Analyze slow resources
      const slowResources = resourceEntries.filter(entry => entry.duration > 1000);
      if (slowResources.length > 0) {
        console.warn('Slow loading resources detected:', slowResources);
        this.reportIssue('slow_resources', {
          count: slowResources.length,
          resources: slowResources.map(r => ({ name: r.name, duration: r.duration })),
        });
      }
    }
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };

      // Check memory usage every 10 seconds
      setInterval(() => {
        const currentMemory = (performance as any).memory;
        const usedMB = currentMemory.usedJSHeapSize / (1024 * 1024);
        
        if (usedMB > 100) { // Alert if > 100MB
          console.warn(`High memory usage: ${usedMB.toFixed(1)}MB`);
          this.reportIssue('high_memory_usage', {
            usedMB,
            timestamp: Date.now(),
          });
        }
      }, 10000);
    }
  }

  private collectFallbackMetrics() {
    // Fallback timing using deprecated API
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      
      if (!this.metrics.fcp && timing.loadEventEnd) {
        // Rough FCP estimate
        this.metrics.fcp = timing.loadEventEnd - timing.navigationStart;
      }
      
      if (!this.metrics.ttfb) {
        this.metrics.ttfb = timing.responseStart - timing.fetchStart;
      }
    }
  }

  private evaluateMetric(metricName: keyof PerformanceThresholds, value: number) {
    const threshold = this.thresholds[metricName];
    const isGood = value <= threshold;
    
    if (!isGood) {
      console.warn(`Performance metric ${metricName} exceeds threshold:`, {
        value,
        threshold,
        unit: metricName === 'cls' ? 'score' : 'ms',
      });
      
      this.reportIssue(`poor_${metricName}`, {
        value,
        threshold,
        timestamp: Date.now(),
      });
    }
  }

  // Bundle size monitoring
  setBundleSize(size: number) {
    this.metrics.bundleSize = size;
    
    const sizeMB = size / (1024 * 1024);
    console.log(`Bundle size: ${sizeMB.toFixed(2)}MB`);
    
    if (sizeMB > 0.5) { // Alert if bundle > 500KB
      this.reportIssue('large_bundle_size', {
        sizeMB,
        sizeBytes: size,
        timestamp: Date.now(),
      });
    }
  }

  // Component render tracking
  trackComponentRender(componentName: string, renderTime: number) {
    if (renderTime > 16.67) { // 60fps threshold
      console.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
      this.reportIssue('slow_component_render', {
        componentName,
        renderTime,
        timestamp: Date.now(),
      });
    }
  }

  // API call tracking
  trackAPICall(endpoint: string, duration: number, success: boolean) {
    if (duration > 1000) { // > 1 second
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
      this.reportIssue('slow_api_call', {
        endpoint,
        duration,
        success,
        timestamp: Date.now(),
      });
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Generate performance score
  getPerformanceScore(): number {
    let score = 100;
    
    if (this.metrics.fcp && this.metrics.fcp > this.thresholds.fcp) {
      score -= 15;
    }
    
    if (this.metrics.lcp && this.metrics.lcp > this.thresholds.lcp) {
      score -= 20;
    }
    
    if (this.metrics.fid && this.metrics.fid > this.thresholds.fid) {
      score -= 15;
    }
    
    if (this.metrics.cls && this.metrics.cls > this.thresholds.cls) {
      score -= 15;
    }
    
    if (this.metrics.ttfb && this.metrics.ttfb > this.thresholds.ttfb) {
      score -= 15;
    }
    
    if (this.metrics.tti && this.metrics.tti > this.thresholds.tti) {
      score -= 20;
    }
    
    return Math.max(score, 0);
  }

  // Report performance issue
  private reportIssue(type: string, data: any) {
    console.warn(`Performance issue: ${type}`, data);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Analytics.track('performance_issue', { type, ...data });
    }
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();
    
    const report = {
      timestamp: new Date().toISOString(),
      score,
      metrics: {
        fcp: metrics.fcp ? `${metrics.fcp.toFixed(1)}ms` : 'N/A',
        lcp: metrics.lcp ? `${metrics.lcp.toFixed(1)}ms` : 'N/A',
        fid: metrics.fid ? `${metrics.fid.toFixed(1)}ms` : 'N/A',
        cls: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
        ttfb: metrics.ttfb ? `${metrics.ttfb.toFixed(1)}ms` : 'N/A',
        tti: metrics.tti ? `${metrics.tti.toFixed(1)}ms` : 'N/A',
      },
      thresholds: {
        fcp: `${this.thresholds.fcp}ms`,
        lcp: `${this.thresholds.lcp}ms`,
        fid: `${this.thresholds.fid}ms`,
        cls: this.thresholds.cls,
        ttfb: `${this.thresholds.ttfb}ms`,
        tti: `${this.thresholds.tti}ms`,
      },
      recommendations: this.generateRecommendations(),
    };
    
    console.log('Performance Report:', report);
    return report;
  }

  private generateRecommendations() {
    const recommendations: string[] = [];
    
    if (this.metrics.fcp && this.metrics.fcp > this.thresholds.fcp) {
      recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
    }
    
    if (this.metrics.lcp && this.metrics.lcp > this.thresholds.lcp) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical path');
    }
    
    if (this.metrics.fid && this.metrics.fid > this.thresholds.fid) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time');
    }
    
    if (this.metrics.cls && this.metrics.cls > this.thresholds.cls) {
      recommendations.push('Fix Cumulative Layout Shift by adding dimensions to images and ads');
    }
    
    if (this.metrics.ttfb && this.metrics.ttfb > this.thresholds.ttfb) {
      recommendations.push('Improve Time to First Byte by optimizing server response time');
    }
    
    return recommendations;
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React Hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = WebPerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      monitor.trackComponentRender(componentName, renderTime);
    };
  }, [componentName, monitor]);
  
  return monitor;
};

// Singleton instance
export const webPerformanceMonitor = WebPerformanceMonitor.getInstance();

export default WebPerformanceMonitor;