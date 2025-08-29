#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * React Native Bundle Analyzer
 * Analyzes bundle size, dependency impact, and provides optimization recommendations
 */

class BundleAnalyzer {
  constructor() {
    this.bundlePath = '';
    this.bundleMap = '';
    this.outputDir = path.join(__dirname, '../bundle-analysis');
    this.results = {
      bundleSize: 0,
      gzippedSize: 0,
      modules: [],
      dependencies: {},
      recommendations: [],
      metrics: {
        duplicateDependencies: 0,
        unusedDependencies: 0,
        largeModules: 0,
        totalModules: 0
      }
    };
  }

  async analyze() {
    console.log('🔍 Starting bundle analysis...');
    
    try {
      // Create output directory
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Generate bundle with source maps
      await this.generateBundle();
      
      // Analyze bundle size
      await this.analyzeBundleSize();
      
      // Analyze dependencies
      await this.analyzeDependencies();
      
      // Generate recommendations
      await this.generateRecommendations();
      
      // Create reports
      await this.generateReports();
      
      console.log('✅ Bundle analysis complete!');
      console.log(`📊 Reports generated in: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  async generateBundle() {
    console.log('📦 Generating bundle...');
    
    try {
      // Generate release bundle
      const bundleCommand = [
        'npx react-native bundle',
        '--platform android',
        '--dev false',
        '--entry-file index.js',
        '--bundle-output ./bundle-analysis/main.jsbundle',
        '--sourcemap-output ./bundle-analysis/main.jsbundle.map',
        '--assets-dest ./bundle-analysis/assets',
        '--verbose'
      ].join(' ');
      
      execSync(bundleCommand, { stdio: 'inherit' });
      
      this.bundlePath = path.join(this.outputDir, 'main.jsbundle');
      this.bundleMap = path.join(this.outputDir, 'main.jsbundle.map');
      
    } catch (error) {
      throw new Error(`Failed to generate bundle: ${error.message}`);
    }
  }

  async analyzeBundleSize() {
    console.log('📏 Analyzing bundle size...');
    
    if (!fs.existsSync(this.bundlePath)) {
      throw new Error('Bundle file not found');
    }

    const stats = fs.statSync(this.bundlePath);
    this.results.bundleSize = stats.size;
    
    // Calculate gzipped size (approximation)
    try {
      const zlib = require('zlib');
      const bundleContent = fs.readFileSync(this.bundlePath);
      const compressed = zlib.gzipSync(bundleContent);
      this.results.gzippedSize = compressed.length;
    } catch (error) {
      console.warn('Could not calculate gzipped size:', error.message);
    }

    console.log(`Bundle size: ${this.formatBytes(this.results.bundleSize)}`);
    console.log(`Gzipped size: ${this.formatBytes(this.results.gzippedSize)}`);
  }

  async analyzeDependencies() {
    console.log('🔎 Analyzing dependencies...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    // Calculate dependency sizes (approximate)
    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const depPath = path.join(__dirname, '../node_modules', name);
        if (fs.existsSync(depPath)) {
          const size = this.calculateDirectorySize(depPath);
          this.results.dependencies[name] = {
            version,
            size,
            type: packageJson.dependencies[name] ? 'production' : 'development'
          };
        }
      } catch (error) {
        console.warn(`Could not analyze dependency ${name}:`, error.message);
      }
    }

    this.results.metrics.totalModules = Object.keys(this.results.dependencies).length;
    
    // Find large dependencies (>1MB)
    const largeDeps = Object.entries(this.results.dependencies)
      .filter(([, info]) => info.size > 1024 * 1024)
      .sort((a, b) => b[1].size - a[1].size);
    
    this.results.metrics.largeModules = largeDeps.length;
    
    console.log(`Total dependencies: ${this.results.metrics.totalModules}`);
    console.log(`Large dependencies (>1MB): ${this.results.metrics.largeModules}`);
    
    if (largeDeps.length > 0) {
      console.log('📊 Top large dependencies:');
      largeDeps.slice(0, 5).forEach(([name, info]) => {
        console.log(`  • ${name}: ${this.formatBytes(info.size)}`);
      });
    }
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    const bundleSizeMB = this.results.bundleSize / (1024 * 1024);
    
    // Bundle size recommendations
    if (bundleSizeMB > 15) {
      recommendations.push({
        type: 'critical',
        category: 'bundle-size',
        title: 'Bundle size is too large',
        description: `Bundle size is ${bundleSizeMB.toFixed(1)}MB. Target should be under 10MB.`,
        impact: 'high',
        effort: 'medium',
        actions: [
          'Implement code splitting',
          'Enable tree shaking',
          'Remove unused dependencies',
          'Use bundle splitting strategies'
        ]
      });
    }
    
    // Memory usage recommendations
    const heavyDeps = Object.entries(this.results.dependencies)
      .filter(([, info]) => info.size > 2 * 1024 * 1024)
      .map(([name]) => name);
    
    if (heavyDeps.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'dependencies',
        title: 'Heavy dependencies detected',
        description: `Found ${heavyDeps.length} dependencies larger than 2MB: ${heavyDeps.slice(0, 3).join(', ')}`,
        impact: 'medium',
        effort: 'high',
        actions: [
          'Consider lighter alternatives',
          'Use dynamic imports for heavy modules',
          'Implement lazy loading',
          'Bundle only necessary parts'
        ]
      });
    }
    
    // Performance recommendations
    recommendations.push({
      type: 'info',
      category: 'performance',
      title: 'Bundle optimization strategies',
      description: 'General optimization techniques for React Native bundles',
      impact: 'medium',
      effort: 'medium',
      actions: [
        'Enable Hermes engine',
        'Use Flipper for performance monitoring',
        'Implement RAM bundles for large apps',
        'Optimize images and assets',
        'Use react-native-bundle-visualizer'
      ]
    });

    // Metro bundler optimizations
    recommendations.push({
      type: 'info',
      category: 'bundler',
      title: 'Metro bundler optimizations',
      description: 'Configure Metro bundler for better performance',
      impact: 'medium',
      effort: 'low',
      actions: [
        'Enable minification in production',
        'Configure tree shaking',
        'Use babel plugins for optimization',
        'Enable source map generation for debugging'
      ]
    });

    this.results.recommendations = recommendations;
    
    console.log(`Generated ${recommendations.length} recommendations`);
  }

  async generateReports() {
    console.log('📋 Generating reports...');
    
    // JSON Report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      bundleSize: {
        raw: this.results.bundleSize,
        formatted: this.formatBytes(this.results.bundleSize),
        gzipped: this.results.gzippedSize,
        gzippedFormatted: this.formatBytes(this.results.gzippedSize)
      },
      metrics: this.results.metrics,
      dependencies: this.results.dependencies,
      recommendations: this.results.recommendations,
      performance: {
        bundleSizeScore: this.calculateBundleSizeScore(),
        dependencyScore: this.calculateDependencyScore(),
        overallScore: this.calculateOverallScore()
      }
    };
    
    fs.writeFileSync(
      path.join(this.outputDir, 'bundle-analysis.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // HTML Report
    const htmlReport = this.generateHTMLReport(jsonReport);
    fs.writeFileSync(
      path.join(this.outputDir, 'bundle-analysis.html'),
      htmlReport
    );

    // Markdown Report
    const markdownReport = this.generateMarkdownReport(jsonReport);
    fs.writeFileSync(
      path.join(this.outputDir, 'BUNDLE_ANALYSIS.md'),
      markdownReport
    );

    // Performance budget check
    const budgetReport = this.checkPerformanceBudget(jsonReport);
    fs.writeFileSync(
      path.join(this.outputDir, 'performance-budget.json'),
      JSON.stringify(budgetReport, null, 2)
    );
  }

  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>React Native Bundle Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #007AFF; padding-bottom: 20px; margin-bottom: 30px; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007AFF; }
    .metric-value { font-size: 2em; font-weight: bold; color: #007AFF; }
    .metric-label { color: #666; margin-top: 5px; }
    .recommendations { margin: 30px 0; }
    .recommendation { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; }
    .recommendation.critical { border-left: 4px solid #FF3B30; }
    .recommendation.warning { border-left: 4px solid #FF9500; }
    .recommendation.info { border-left: 4px solid #007AFF; }
    .actions { margin-top: 15px; }
    .actions li { margin: 5px 0; }
    .score { font-size: 3em; font-weight: bold; text-align: center; margin: 20px 0; }
    .score.good { color: #34C759; }
    .score.warning { color: #FF9500; }
    .score.critical { color: #FF3B30; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📱 React Native Bundle Analysis</h1>
      <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-value">${data.bundleSize.formatted}</div>
        <div class="metric-label">Bundle Size</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.bundleSize.gzippedFormatted}</div>
        <div class="metric-label">Gzipped Size</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.totalModules}</div>
        <div class="metric-label">Total Dependencies</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.largeModules}</div>
        <div class="metric-label">Large Modules (>1MB)</div>
      </div>
    </div>

    <div class="score ${this.getScoreClass(data.performance.overallScore)}">
      Performance Score: ${data.performance.overallScore}/100
    </div>

    <div class="recommendations">
      <h2>🔧 Optimization Recommendations</h2>
      ${data.recommendations.map(rec => `
        <div class="recommendation ${rec.type}">
          <h3>${rec.title}</h3>
          <p><strong>Category:</strong> ${rec.category} | <strong>Impact:</strong> ${rec.impact} | <strong>Effort:</strong> ${rec.effort}</p>
          <p>${rec.description}</p>
          <div class="actions">
            <strong>Recommended Actions:</strong>
            <ul>${rec.actions.map(action => `<li>${action}</li>`).join('')}</ul>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
  }

  generateMarkdownReport(data) {
    return `# 📱 React Native Bundle Analysis Report

Generated on: ${new Date(data.timestamp).toLocaleString()}

## 📊 Bundle Metrics

| Metric | Value |
|--------|-------|
| Bundle Size | ${data.bundleSize.formatted} |
| Gzipped Size | ${data.bundleSize.gzippedFormatted} |
| Total Dependencies | ${data.metrics.totalModules} |
| Large Modules (>1MB) | ${data.metrics.largeModules} |

## 🎯 Performance Score: ${data.performance.overallScore}/100

- Bundle Size Score: ${data.performance.bundleSizeScore}/100
- Dependency Score: ${data.performance.dependencyScore}/100

## 🔧 Optimization Recommendations

${data.recommendations.map(rec => `
### ${rec.title} (${rec.type.toUpperCase()})

**Category:** ${rec.category} | **Impact:** ${rec.impact} | **Effort:** ${rec.effort}

${rec.description}

**Recommended Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## 📈 Performance Budget Status

${this.generateBudgetStatus(data)}
`;
  }

  checkPerformanceBudget(data) {
    const budget = {
      bundleSize: { limit: 10 * 1024 * 1024, current: data.bundleSize.raw }, // 10MB
      gzippedSize: { limit: 3 * 1024 * 1024, current: data.bundleSize.gzipped }, // 3MB
      dependencies: { limit: 50, current: data.metrics.totalModules },
      largeModules: { limit: 5, current: data.metrics.largeModules }
    };

    const results = {};
    for (const [key, value] of Object.entries(budget)) {
      results[key] = {
        ...value,
        passed: value.current <= value.limit,
        percentage: (value.current / value.limit) * 100
      };
    }

    return {
      timestamp: data.timestamp,
      budget: results,
      overallPassed: Object.values(results).every(r => r.passed)
    };
  }

  generateBudgetStatus(data) {
    const budgetCheck = this.checkPerformanceBudget(data);
    let status = '✅ **All performance budgets passed!**';
    
    if (!budgetCheck.overallPassed) {
      status = '❌ **Some performance budgets failed:**\n\n';
      Object.entries(budgetCheck.budget).forEach(([key, budget]) => {
        const icon = budget.passed ? '✅' : '❌';
        const percentage = budget.percentage.toFixed(1);
        status += `${icon} ${key}: ${percentage}% of budget\n`;
      });
    }
    
    return status;
  }

  calculateBundleSizeScore() {
    const bundleSizeMB = this.results.bundleSize / (1024 * 1024);
    if (bundleSizeMB <= 5) return 100;
    if (bundleSizeMB <= 10) return 80;
    if (bundleSizeMB <= 15) return 60;
    if (bundleSizeMB <= 20) return 40;
    return 20;
  }

  calculateDependencyScore() {
    const { totalModules, largeModules } = this.results.metrics;
    let score = 100;
    
    if (totalModules > 100) score -= 20;
    if (totalModules > 150) score -= 20;
    if (largeModules > 10) score -= 30;
    if (largeModules > 20) score -= 30;
    
    return Math.max(score, 0);
  }

  calculateOverallScore() {
    const bundleScore = this.calculateBundleSizeScore();
    const depScore = this.calculateDependencyScore();
    return Math.round((bundleScore + depScore) / 2);
  }

  getScoreClass(score) {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.calculateDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = BundleAnalyzer;