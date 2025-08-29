const fs = require('fs');
const path = require('path');
const gzipSize = require('gzip-size');

/**
 * Web Bundle Analyzer for React Application
 * Analyzes webpack bundle size and provides optimization recommendations
 */

class WebBundleAnalyzer {
  constructor() {
    this.buildPath = path.join(__dirname, '../build');
    this.outputDir = path.join(__dirname, '../build/analysis');
    this.results = {
      totalSize: 0,
      gzippedSize: 0,
      jsFiles: [],
      cssFiles: [],
      assets: [],
      chunks: {},
      recommendations: [],
      metrics: {
        jsSize: 0,
        cssSize: 0,
        assetSize: 0,
        chunkCount: 0,
      }
    };
  }

  async analyze() {
    console.log('🔍 Starting web bundle analysis...');
    
    try {
      // Ensure build exists
      if (!fs.existsSync(this.buildPath)) {
        throw new Error('Build directory not found. Run "npm run build" first.');
      }

      // Create output directory
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Analyze bundle files
      await this.analyzeBundle();
      
      // Generate recommendations
      await this.generateRecommendations();
      
      // Create reports
      await this.generateReports();
      
      console.log('✅ Web bundle analysis complete!');
      console.log(`📊 Reports generated in: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Web bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeBundle() {
    console.log('📦 Analyzing bundle files...');
    
    const staticPath = path.join(this.buildPath, 'static');
    
    // Analyze JavaScript files
    await this.analyzeJSFiles(path.join(staticPath, 'js'));
    
    // Analyze CSS files
    await this.analyzeCSSFiles(path.join(staticPath, 'css'));
    
    // Analyze other assets
    await this.analyzeAssets(path.join(staticPath, 'media'));
    
    // Calculate totals
    this.calculateTotals();
    
    console.log(`Total bundle size: ${this.formatBytes(this.results.totalSize)}`);
    console.log(`Total gzipped size: ${this.formatBytes(this.results.gzippedSize)}`);
  }

  async analyzeJSFiles(jsPath) {
    if (!fs.existsSync(jsPath)) return;
    
    const files = fs.readdirSync(jsPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(jsPath, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath);
        
        const fileInfo = {
          name: file,
          size: stats.size,
          gzippedSize: await gzipSize(content),
          type: this.getFileType(file),
          path: filePath,
        };
        
        this.results.jsFiles.push(fileInfo);
        this.results.metrics.jsSize += stats.size;
      }
    }
    
    // Sort by size (largest first)
    this.results.jsFiles.sort((a, b) => b.size - a.size);
  }

  async analyzeCSSFiles(cssPath) {
    if (!fs.existsSync(cssPath)) return;
    
    const files = fs.readdirSync(cssPath);
    
    for (const file of files) {
      if (file.endsWith('.css')) {
        const filePath = path.join(cssPath, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath);
        
        const fileInfo = {
          name: file,
          size: stats.size,
          gzippedSize: await gzipSize(content),
          path: filePath,
        };
        
        this.results.cssFiles.push(fileInfo);
        this.results.metrics.cssSize += stats.size;
      }
    }
    
    this.results.cssFiles.sort((a, b) => b.size - a.size);
  }

  async analyzeAssets(mediaPath) {
    if (!fs.existsSync(mediaPath)) return;
    
    const files = fs.readdirSync(mediaPath);
    
    for (const file of files) {
      const filePath = path.join(mediaPath, file);
      const stats = fs.statSync(filePath);
      
      const assetInfo = {
        name: file,
        size: stats.size,
        type: path.extname(file),
        path: filePath,
      };
      
      this.results.assets.push(assetInfo);
      this.results.metrics.assetSize += stats.size;
    }
    
    this.results.assets.sort((a, b) => b.size - a.size);
  }

  calculateTotals() {
    this.results.totalSize = 
      this.results.metrics.jsSize + 
      this.results.metrics.cssSize + 
      this.results.metrics.assetSize;
      
    this.results.gzippedSize = 
      this.results.jsFiles.reduce((sum, file) => sum + file.gzippedSize, 0) +
      this.results.cssFiles.reduce((sum, file) => sum + file.gzippedSize, 0);
      
    this.results.metrics.chunkCount = this.results.jsFiles.length;
  }

  getFileType(filename) {
    if (filename.includes('main.')) return 'main';
    if (filename.includes('vendor.') || filename.includes('chunk.')) return 'vendor';
    if (filename.includes('runtime.')) return 'runtime';
    if (filename.match(/\d+\./)) return 'chunk';
    return 'other';
  }

  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const recommendations = [];
    const totalSizeKB = this.results.totalSize / 1024;
    const gzippedSizeKB = this.results.gzippedSize / 1024;
    
    // Bundle size recommendations
    if (gzippedSizeKB > 250) {
      recommendations.push({
        type: 'critical',
        category: 'bundle-size',
        title: 'Bundle size is too large',
        description: `Gzipped bundle size is ${gzippedSizeKB.toFixed(1)}KB. Target should be under 250KB.`,
        impact: 'high',
        effort: 'medium',
        actions: [
          'Implement code splitting with React.lazy()',
          'Use dynamic imports for heavy components',
          'Enable tree shaking',
          'Remove unused dependencies',
          'Use bundle analysis tools like webpack-bundle-analyzer'
        ]
      });
    }

    // Large files recommendations
    const largeJSFiles = this.results.jsFiles.filter(file => file.size > 100 * 1024);
    if (largeJSFiles.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'code-splitting',
        title: 'Large JavaScript files detected',
        description: `Found ${largeJSFiles.length} JS files larger than 100KB: ${largeJSFiles.slice(0, 3).map(f => f.name).join(', ')}`,
        impact: 'medium',
        effort: 'medium',
        actions: [
          'Split large components into smaller chunks',
          'Use React.lazy() for route-based code splitting',
          'Implement component-level code splitting',
          'Move heavy libraries to separate chunks'
        ]
      });
    }

    // Vendor chunk optimization
    const vendorFiles = this.results.jsFiles.filter(file => file.type === 'vendor');
    const totalVendorSize = vendorFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalVendorSize > 200 * 1024) {
      recommendations.push({
        type: 'warning',
        category: 'vendor-optimization',
        title: 'Large vendor bundle',
        description: `Vendor bundle is ${(totalVendorSize / 1024).toFixed(1)}KB. Consider splitting vendor dependencies.`,
        impact: 'medium',
        effort: 'high',
        actions: [
          'Split vendor bundle by update frequency',
          'Create separate chunks for large libraries (React, MUI)',
          'Use externals for CDN-hosted libraries',
          'Implement selective imports from large libraries'
        ]
      });
    }

    // CSS optimization
    if (this.results.metrics.cssSize > 50 * 1024) {
      recommendations.push({
        type: 'info',
        category: 'css-optimization',
        title: 'CSS bundle optimization',
        description: `CSS size is ${(this.results.metrics.cssSize / 1024).toFixed(1)}KB. Consider optimization strategies.`,
        impact: 'low',
        effort: 'low',
        actions: [
          'Use CSS-in-JS with tree shaking',
          'Remove unused CSS with PurgeCSS',
          'Use critical CSS extraction',
          'Optimize CSS minification'
        ]
      });
    }

    // Asset optimization
    const largeAssets = this.results.assets.filter(asset => asset.size > 100 * 1024);
    if (largeAssets.length > 0) {
      recommendations.push({
        type: 'info',
        category: 'asset-optimization',
        title: 'Large assets detected',
        description: `Found ${largeAssets.length} assets larger than 100KB`,
        impact: 'medium',
        effort: 'low',
        actions: [
          'Optimize images with WebP format',
          'Implement lazy loading for images',
          'Use responsive images with srcSet',
          'Compress images and use CDN'
        ]
      });
    }

    // Performance budget
    recommendations.push({
      type: 'info',
      category: 'performance-budget',
      title: 'Performance budget guidelines',
      description: 'Implement performance budgets to prevent regressions',
      impact: 'medium',
      effort: 'low',
      actions: [
        'Set bundle size budget: JS < 200KB gzipped',
        'Set asset size budget: Images < 500KB total',
        'Monitor bundle size in CI/CD',
        'Use Lighthouse CI for performance testing'
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
        total: this.results.totalSize,
        totalFormatted: this.formatBytes(this.results.totalSize),
        gzipped: this.results.gzippedSize,
        gzippedFormatted: this.formatBytes(this.results.gzippedSize),
      },
      metrics: this.results.metrics,
      files: {
        javascript: this.results.jsFiles,
        css: this.results.cssFiles,
        assets: this.results.assets,
      },
      recommendations: this.results.recommendations,
      performance: {
        bundleSizeScore: this.calculateBundleSizeScore(),
        overallScore: this.calculateOverallScore(),
      }
    };
    
    fs.writeFileSync(
      path.join(this.outputDir, 'web-bundle-analysis.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // HTML Report
    const htmlReport = this.generateHTMLReport(jsonReport);
    fs.writeFileSync(
      path.join(this.outputDir, 'web-bundle-analysis.html'),
      htmlReport
    );

    // Markdown Report
    const markdownReport = this.generateMarkdownReport(jsonReport);
    fs.writeFileSync(
      path.join(this.outputDir, 'WEB_BUNDLE_ANALYSIS.md'),
      markdownReport
    );

    // Performance budget check
    const budgetReport = this.checkPerformanceBudget(jsonReport);
    fs.writeFileSync(
      path.join(this.outputDir, 'web-performance-budget.json'),
      JSON.stringify(budgetReport, null, 2)
    );
  }

  generateHTMLReport(data) {
    const jsFilesTable = data.files.javascript.map(file => `
      <tr>
        <td>${file.name}</td>
        <td>${this.formatBytes(file.size)}</td>
        <td>${this.formatBytes(file.gzippedSize)}</td>
        <td>${file.type}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Web Bundle Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #007AFF; padding-bottom: 20px; margin-bottom: 30px; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007AFF; }
    .metric-value { font-size: 2em; font-weight: bold; color: #007AFF; }
    .metric-label { color: #666; margin-top: 5px; }
    .files-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .files-table th, .files-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .files-table th { background: #f8f9fa; font-weight: 600; }
    .score { font-size: 3em; font-weight: bold; text-align: center; margin: 20px 0; }
    .score.good { color: #34C759; }
    .score.warning { color: #FF9500; }
    .score.critical { color: #FF3B30; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌐 Web Bundle Analysis</h1>
      <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-value">${data.bundleSize.totalFormatted}</div>
        <div class="metric-label">Total Bundle Size</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.bundleSize.gzippedFormatted}</div>
        <div class="metric-label">Gzipped Size</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.files.javascript.length}</div>
        <div class="metric-label">JavaScript Files</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${this.formatBytes(data.metrics.jsSize)}</div>
        <div class="metric-label">JavaScript Size</div>
      </div>
    </div>

    <div class="score ${this.getScoreClass(data.performance.overallScore)}">
      Performance Score: ${data.performance.overallScore}/100
    </div>

    <h2>📁 JavaScript Files</h2>
    <table class="files-table">
      <thead>
        <tr>
          <th>File Name</th>
          <th>Size</th>
          <th>Gzipped</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        ${jsFilesTable}
      </tbody>
    </table>

    <h2>🔧 Optimization Recommendations</h2>
    ${data.recommendations.map(rec => `
      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid ${rec.type === 'critical' ? '#FF3B30' : rec.type === 'warning' ? '#FF9500' : '#007AFF'};">
        <h3>${rec.title}</h3>
        <p><strong>Category:</strong> ${rec.category} | <strong>Impact:</strong> ${rec.impact} | <strong>Effort:</strong> ${rec.effort}</p>
        <p>${rec.description}</p>
        <div>
          <strong>Recommended Actions:</strong>
          <ul>${rec.actions.map(action => `<li>${action}</li>`).join('')}</ul>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  }

  generateMarkdownReport(data) {
    return `# 🌐 Web Bundle Analysis Report

Generated on: ${new Date(data.timestamp).toLocaleString()}

## 📊 Bundle Metrics

| Metric | Value |
|--------|-------|
| Total Bundle Size | ${data.bundleSize.totalFormatted} |
| Gzipped Size | ${data.bundleSize.gzippedFormatted} |
| JavaScript Files | ${data.files.javascript.length} |
| JavaScript Size | ${this.formatBytes(data.metrics.jsSize)} |
| CSS Size | ${this.formatBytes(data.metrics.cssSize)} |
| Assets Size | ${this.formatBytes(data.metrics.assetSize)} |

## 🎯 Performance Score: ${data.performance.overallScore}/100

## 📁 Largest Files

### JavaScript Files
${data.files.javascript.slice(0, 10).map(file => 
  `- ${file.name}: ${this.formatBytes(file.size)} (${this.formatBytes(file.gzippedSize)} gzipped)`
).join('\n')}

## 🔧 Optimization Recommendations

${data.recommendations.map(rec => `
### ${rec.title} (${rec.type.toUpperCase()})

**Category:** ${rec.category} | **Impact:** ${rec.impact} | **Effort:** ${rec.effort}

${rec.description}

**Recommended Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}
`;
  }

  checkPerformanceBudget(data) {
    const budget = {
      totalGzippedSize: { limit: 250 * 1024, current: data.bundleSize.gzipped }, // 250KB
      jsSize: { limit: 200 * 1024, current: data.metrics.jsSize }, // 200KB
      cssSize: { limit: 50 * 1024, current: data.metrics.cssSize }, // 50KB
      assetSize: { limit: 500 * 1024, current: data.metrics.assetSize }, // 500KB
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

  calculateBundleSizeScore() {
    const gzippedSizeKB = this.results.gzippedSize / 1024;
    if (gzippedSizeKB <= 100) return 100;
    if (gzippedSizeKB <= 150) return 90;
    if (gzippedSizeKB <= 200) return 80;
    if (gzippedSizeKB <= 250) return 70;
    if (gzippedSizeKB <= 300) return 60;
    return 40;
  }

  calculateOverallScore() {
    return this.calculateBundleSizeScore();
  }

  getScoreClass(score) {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'critical';
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
  const analyzer = new WebBundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = WebBundleAnalyzer;