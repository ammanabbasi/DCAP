#!/usr/bin/env node

/**
 * Comprehensive Test Coverage Reporter
 * Generates detailed coverage reports across all workspaces
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class CoverageReporter {
  constructor() {
    this.workspaces = ['backend', 'web', 'mobile', 'shared'];
    this.coverageThresholds = {
      backend: { branches: 80, functions: 80, lines: 80, statements: 80 },
      web: { branches: 70, functions: 70, lines: 70, statements: 70 },
      mobile: { branches: 60, functions: 60, lines: 60, statements: 60 },
      shared: { branches: 90, functions: 90, lines: 90, statements: 90 },
    };
    this.reportDir = path.join(__dirname, '..', 'coverage-reports');
  }

  async generateReports() {
    console.log('🔍 Generating comprehensive test coverage reports...\n');

    // Create reports directory
    await this.ensureDirectory(this.reportDir);

    const results = [];

    for (const workspace of this.workspaces) {
      try {
        console.log(`📊 Processing ${workspace}...`);
        const result = await this.processWorkspace(workspace);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error processing ${workspace}:`, error.message);
        results.push({
          workspace,
          error: error.message,
          coverage: null
        });
      }
    }

    // Generate combined report
    await this.generateCombinedReport(results);

    // Generate HTML dashboard
    await this.generateHtmlDashboard(results);

    console.log('\n✅ Coverage reports generated successfully!');
    console.log(`📂 Reports available at: ${this.reportDir}`);

    return results;
  }

  async processWorkspace(workspace) {
    const workspacePath = path.join(__dirname, '..', workspace);
    const coveragePath = path.join(workspacePath, 'coverage');

    // Check if coverage exists
    try {
      await fs.access(coveragePath);
    } catch (error) {
      throw new Error(`No coverage data found for ${workspace}. Run tests first.`);
    }

    // Read coverage summary
    const summaryPath = path.join(coveragePath, 'coverage-summary.json');
    const coverageData = await this.readCoverageSummary(summaryPath);

    // Copy coverage reports to central location
    const workspaceReportDir = path.join(this.reportDir, workspace);
    await this.ensureDirectory(workspaceReportDir);
    await this.copyDirectory(coveragePath, workspaceReportDir);

    // Analyze coverage against thresholds
    const analysis = this.analyzeCoverage(workspace, coverageData);

    return {
      workspace,
      coverage: coverageData,
      analysis,
      reportPath: workspaceReportDir
    };
  }

  async readCoverageSummary(summaryPath) {
    try {
      const summaryContent = await fs.readFile(summaryPath, 'utf8');
      return JSON.parse(summaryContent);
    } catch (error) {
      throw new Error(`Could not read coverage summary: ${error.message}`);
    }
  }

  analyzeCoverage(workspace, coverageData) {
    const thresholds = this.coverageThresholds[workspace];
    const total = coverageData.total;

    const analysis = {
      passes: true,
      issues: [],
      metrics: {}
    };

    for (const [metric, threshold] of Object.entries(thresholds)) {
      const actual = total[metric].pct;
      const passes = actual >= threshold;

      analysis.metrics[metric] = {
        actual,
        threshold,
        passes,
        diff: actual - threshold
      };

      if (!passes) {
        analysis.passes = false;
        analysis.issues.push({
          metric,
          actual,
          threshold,
          shortfall: threshold - actual
        });
      }
    }

    return analysis;
  }

  async generateCombinedReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalWorkspaces: results.length,
        passedWorkspaces: results.filter(r => r.analysis && r.analysis.passes).length,
        failedWorkspaces: results.filter(r => r.analysis && !r.analysis.passes).length,
        errorWorkspaces: results.filter(r => r.error).length
      },
      workspaces: results.map(result => ({
        name: result.workspace,
        status: result.error ? 'error' : result.analysis.passes ? 'pass' : 'fail',
        error: result.error,
        coverage: result.coverage ? {
          branches: result.coverage.total.branches.pct,
          functions: result.coverage.total.functions.pct,
          lines: result.coverage.total.lines.pct,
          statements: result.coverage.total.statements.pct
        } : null,
        issues: result.analysis ? result.analysis.issues : []
      })),
      details: results
    };

    const reportPath = path.join(this.reportDir, 'combined-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate text summary
    await this.generateTextSummary(report);

    return report;
  }

  async generateTextSummary(report) {
    let summary = '';
    summary += '# DealersCloud Test Coverage Report\n\n';
    summary += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;

    summary += '## Summary\n\n';
    summary += `- Total Workspaces: ${report.summary.totalWorkspaces}\n`;
    summary += `- Passed: ${report.summary.passedWorkspaces} ✅\n`;
    summary += `- Failed: ${report.summary.failedWorkspaces} ❌\n`;
    summary += `- Errors: ${report.summary.errorWorkspaces} ⚠️\n\n`;

    summary += '## Workspace Details\n\n';

    for (const workspace of report.workspaces) {
      const status = workspace.status === 'pass' ? '✅' : 
                    workspace.status === 'fail' ? '❌' : '⚠️';
      
      summary += `### ${workspace.name} ${status}\n\n`;

      if (workspace.error) {
        summary += `Error: ${workspace.error}\n\n`;
        continue;
      }

      if (workspace.coverage) {
        summary += '| Metric | Coverage | Status |\n';
        summary += '|--------|----------|--------|\n';
        
        const thresholds = this.coverageThresholds[workspace.name];
        
        for (const [metric, value] of Object.entries(workspace.coverage)) {
          const threshold = thresholds[metric];
          const status = value >= threshold ? '✅' : '❌';
          summary += `| ${metric.charAt(0).toUpperCase() + metric.slice(1)} | ${value.toFixed(1)}% | ${status} |\n`;
        }
        
        summary += '\n';
      }

      if (workspace.issues.length > 0) {
        summary += '**Issues:**\n';
        for (const issue of workspace.issues) {
          summary += `- ${issue.metric}: ${issue.actual.toFixed(1)}% (need ${issue.threshold}%, shortfall: ${issue.shortfall.toFixed(1)}%)\n`;
        }
        summary += '\n';
      }
    }

    // Performance metrics
    summary += '## Performance Insights\n\n';
    summary += this.generatePerformanceInsights(report);

    const summaryPath = path.join(this.reportDir, 'COVERAGE_SUMMARY.md');
    await fs.writeFile(summaryPath, summary);

    console.log('\n' + summary);
  }

  generatePerformanceInsights(report) {
    let insights = '';
    
    const coverageData = report.workspaces.filter(w => w.coverage).map(w => ({
      name: w.name,
      ...w.coverage
    }));

    if (coverageData.length === 0) {
      return 'No coverage data available for performance analysis.\n\n';
    }

    // Calculate averages
    const metrics = ['branches', 'functions', 'lines', 'statements'];
    const averages = {};

    for (const metric of metrics) {
      const values = coverageData.map(d => d[metric]);
      averages[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    insights += '### Overall Coverage Averages\n\n';
    insights += '| Metric | Average Coverage |\n';
    insights += '|--------|------------------|\n';

    for (const [metric, avg] of Object.entries(averages)) {
      insights += `| ${metric.charAt(0).toUpperCase() + metric.slice(1)} | ${avg.toFixed(1)}% |\n`;
    }

    insights += '\n';

    // Best and worst performers
    const linesCoverage = coverageData.map(d => ({ name: d.name, lines: d.lines }))
      .sort((a, b) => b.lines - a.lines);

    insights += '### Performance Rankings (by Line Coverage)\n\n';
    insights += '| Rank | Workspace | Lines Coverage |\n';
    insights += '|------|-----------|----------------|\n';

    linesCoverage.forEach((item, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      insights += `| ${index + 1} ${medal} | ${item.name} | ${item.lines.toFixed(1)}% |\n`;
    });

    insights += '\n';

    // Recommendations
    insights += '### Recommendations\n\n';

    const failedWorkspaces = report.workspaces.filter(w => w.status === 'fail');
    if (failedWorkspaces.length > 0) {
      insights += '**Priority Actions:**\n';
      failedWorkspaces.forEach(workspace => {
        insights += `- **${workspace.name}**: `;
        const majorIssues = workspace.issues.filter(i => i.shortfall > 10);
        if (majorIssues.length > 0) {
          insights += `Focus on ${majorIssues.map(i => i.metric).join(', ')} coverage\n`;
        } else {
          insights += `Minor coverage improvements needed\n`;
        }
      });
      insights += '\n';
    }

    const lowCoverageWorkspaces = coverageData.filter(d => d.lines < 70);
    if (lowCoverageWorkspaces.length > 0) {
      insights += '**Coverage Improvement Opportunities:**\n';
      lowCoverageWorkspaces.forEach(workspace => {
        insights += `- ${workspace.name}: Consider adding more integration tests\n`;
      });
      insights += '\n';
    }

    return insights;
  }

  async generateHtmlDashboard(results) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DealersCloud Coverage Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .card h3 { margin: 0 0 8px 0; color: #333; }
        .card .value { font-size: 2em; font-weight: bold; }
        .success { color: #4CAF50; }
        .warning { color: #FF9800; }
        .error { color: #F44336; }
        .workspace-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .workspace-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .workspace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .status-badge { padding: 4px 12px; border-radius: 16px; font-size: 0.85em; font-weight: bold; }
        .status-pass { background: #E8F5E8; color: #2E7D2E; }
        .status-fail { background: #FFEBEE; color: #C62828; }
        .status-error { background: #FFF3E0; color: #E65100; }
        .metric-bar { margin: 8px 0; }
        .metric-label { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .progress-bar { height: 8px; background: #E0E0E0; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .progress-good { background: #4CAF50; }
        .progress-warning { background: #FF9800; }
        .progress-poor { background: #F44336; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ DealersCloud Test Coverage Dashboard</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        ${this.generateSummaryCards(results)}
        
        <div class="workspace-grid">
            ${results.map(result => this.generateWorkspaceCard(result)).join('')}
        </div>
    </div>

    <script>
        // Add interactive features
        document.addEventListener('DOMContentLoaded', function() {
            // Animate progress bars
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => bar.style.width = width, 100);
            });
        });
    </script>
</body>
</html>`;

    const dashboardPath = path.join(this.reportDir, 'index.html');
    await fs.writeFile(dashboardPath, html);
  }

  generateSummaryCards(results) {
    const passed = results.filter(r => r.analysis && r.analysis.passes).length;
    const failed = results.filter(r => r.analysis && !r.analysis.passes).length;
    const errors = results.filter(r => r.error).length;
    const total = results.length;

    return `
        <div class="summary-cards">
            <div class="card">
                <h3>Total Workspaces</h3>
                <div class="value">${total}</div>
            </div>
            <div class="card">
                <h3>Passed</h3>
                <div class="value success">${passed}</div>
            </div>
            <div class="card">
                <h3>Failed</h3>
                <div class="value error">${failed}</div>
            </div>
            <div class="card">
                <h3>Errors</h3>
                <div class="value warning">${errors}</div>
            </div>
        </div>`;
  }

  generateWorkspaceCard(result) {
    const statusClass = result.error ? 'status-error' : 
                       result.analysis && result.analysis.passes ? 'status-pass' : 'status-fail';
    const statusText = result.error ? 'ERROR' : 
                      result.analysis && result.analysis.passes ? 'PASS' : 'FAIL';

    let content = `
        <div class="workspace-card">
            <div class="workspace-header">
                <h3>${result.workspace.toUpperCase()}</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>`;

    if (result.error) {
      content += `<p class="error">Error: ${result.error}</p>`;
    } else if (result.coverage) {
      const metrics = ['branches', 'functions', 'lines', 'statements'];
      const thresholds = this.coverageThresholds[result.workspace];

      for (const metric of metrics) {
        const value = result.coverage.total[metric].pct;
        const threshold = thresholds[metric];
        const progressClass = value >= threshold ? 'progress-good' : 
                             value >= threshold - 10 ? 'progress-warning' : 'progress-poor';

        content += `
            <div class="metric-bar">
                <div class="metric-label">
                    <span>${metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                    <span>${value.toFixed(1)}% / ${threshold}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${Math.min(value, 100)}%"></div>
                </div>
            </div>`;
      }
    }

    content += '</div>';
    return content;
  }

  async ensureDirectory(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async copyDirectory(src, dest) {
    await this.ensureDirectory(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

// Performance benchmarking
class PerformanceBenchmark {
  constructor() {
    this.benchmarks = [];
  }

  async runBenchmarks() {
    console.log('🏃‍♂️ Running performance benchmarks...\n');

    const suites = [
      { name: 'Backend API Performance', command: 'cd backend && npm run test:performance' },
      { name: 'Web Bundle Analysis', command: 'cd web && npm run analyze' },
      { name: 'Mobile Bundle Analysis', command: 'cd mobile && npx react-native bundle --dry-run' },
      { name: 'Database Query Performance', command: 'cd backend && npm run test:db-performance' }
    ];

    for (const suite of suites) {
      try {
        console.log(`📊 Running ${suite.name}...`);
        const start = Date.now();
        
        const result = execSync(suite.command, { 
          encoding: 'utf8',
          timeout: 300000 // 5 minutes timeout
        });
        
        const duration = Date.now() - start;
        
        this.benchmarks.push({
          name: suite.name,
          duration,
          result: result.trim(),
          status: 'success'
        });

        console.log(`✅ ${suite.name} completed in ${duration}ms`);
      } catch (error) {
        console.log(`❌ ${suite.name} failed: ${error.message}`);
        this.benchmarks.push({
          name: suite.name,
          duration: -1,
          result: error.message,
          status: 'failed'
        });
      }
    }

    return this.benchmarks;
  }

  generateBenchmarkReport() {
    const reportPath = path.join(__dirname, '..', 'coverage-reports', 'performance-benchmarks.json');
    const report = {
      timestamp: new Date().toISOString(),
      benchmarks: this.benchmarks,
      summary: {
        total: this.benchmarks.length,
        passed: this.benchmarks.filter(b => b.status === 'success').length,
        failed: this.benchmarks.filter(b => b.status === 'failed').length,
        totalDuration: this.benchmarks
          .filter(b => b.duration > 0)
          .reduce((sum, b) => sum + b.duration, 0)
      }
    };

    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    return report;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const includePerformance = args.includes('--performance');
  const includeSecurityScan = args.includes('--security');

  try {
    // Generate coverage reports
    const reporter = new CoverageReporter();
    const coverageResults = await reporter.generateReports();

    // Run performance benchmarks if requested
    let performanceResults = null;
    if (includePerformance) {
      const benchmark = new PerformanceBenchmark();
      performanceResults = await benchmark.runBenchmarks();
      benchmark.generateBenchmarkReport();
    }

    // Determine exit code based on results
    const hasCoverageFailures = coverageResults.some(r => r.analysis && !r.analysis.passes);
    const hasErrors = coverageResults.some(r => r.error);
    const hasPerformanceFailures = performanceResults && 
      performanceResults.some(r => r.status === 'failed');

    if (hasErrors || hasCoverageFailures || hasPerformanceFailures) {
      console.log('\n❌ Some tests or benchmarks failed. Check the reports for details.');
      process.exit(1);
    } else {
      console.log('\n✅ All coverage thresholds met and benchmarks passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n💥 Report generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CoverageReporter, PerformanceBenchmark };