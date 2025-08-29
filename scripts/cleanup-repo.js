#!/usr/bin/env node
/**
 * Repository Cleanup Script
 * Reorganizes and cleans up the DealersCloud monorepo
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class RepositoryCleaner {
  constructor() {
    this.rootDir = process.cwd();
    this.report = {
      renamedFiles: [],
      deletedFiles: [],
      movedFiles: [],
      errors: []
    };
  }

  /**
   * Clean asset filenames - remove spaces and special characters
   */
  async cleanAssetNames() {
    console.log('\n🧹 Cleaning asset filenames...');
    
    const assetsDir = path.join(this.rootDir, 'mobile', 'src', 'Assets', 'Icons');
    
    try {
      const files = await fs.readdir(assetsDir);
      
      for (const file of files) {
        // Check if filename has problematic characters
        const hasProblematicChars = /[ '()]/g.test(file) || file.includes('9_11_24_PM');
        
        if (hasProblematicChars) {
          // Create clean filename
          let newName = file
            .replace(/carKeta 9\.11\.24.*PM\.png/, 'carKetaAlternate.png')
            .replace(/carKeta_9_11_24_PM\.png/, 'carKetaAlternate.png')
            .replace(/Mobile App \.docx/, 'mobile-app.docx')
            .replace(/mobile_App\.docx/, 'mobile-app.docx')
            .replace(/Mobile_App_Status_Update\.docx/, 'mobile-app-status-update.docx')
            .replace(/ /g, '-')
            .replace(/_/g, '-')
            .replace(/[()]/g, '')
            .toLowerCase();
          
          // Skip if new name is same as old
          if (newName === file) continue;
          
          const oldPath = path.join(assetsDir, file);
          const newPath = path.join(assetsDir, newName);
          
          // Check if target already exists
          try {
            await fs.access(newPath);
            // If file exists, skip or add suffix
            if (file.includes('carKeta')) {
              // Already handled above
              continue;
            }
            console.log(`  ⚠️  Target exists, skipping: ${file}`);
            continue;
          } catch {
            // File doesn't exist, proceed with rename
          }
          
          await fs.rename(oldPath, newPath);
          this.report.renamedFiles.push({ from: file, to: newName });
          console.log(`  ✅ Renamed: ${file} → ${newName}`);
          
          // Update references in code
          await this.updateReferences(file, newName);
        }
      }
    } catch (error) {
      this.report.errors.push(`Asset cleaning error: ${error.message}`);
      console.error(`  ❌ Error cleaning assets: ${error.message}`);
    }
  }

  /**
   * Update references to renamed files in code
   */
  async updateReferences(oldName, newName) {
    const codeFiles = [
      path.join(this.rootDir, 'mobile', 'src', 'Assets', 'icn.ts'),
      path.join(this.rootDir, 'mobile', 'src', 'Assets', 'img.ts')
    ];
    
    for (const file of codeFiles) {
      try {
        let content = await fs.readFile(file, 'utf8');
        const oldRef = oldName.replace(/\.[^.]+$/, ''); // Remove extension
        const newRef = newName.replace(/\.[^.]+$/, '');
        
        // Update import statements
        content = content.replace(
          new RegExp(`require\\(['"]\\./Icons/${oldRef}`, 'g'),
          `require('./Icons/${newRef}`
        );
        
        // Update object keys
        content = content.replace(
          new RegExp(`${oldRef}:`, 'g'),
          `${newRef}:`
        );
        
        await fs.writeFile(file, content);
      } catch (error) {
        // File might not exist or not have references
      }
    }
  }

  /**
   * Remove duplicate and unnecessary files
   */
  async removeDuplicates() {
    console.log('\n🔍 Removing duplicate files...');
    
    const duplicates = [
      'mobile/src/Components/LoadingModal.js', // Keep .tsx version
      'mobile/src/Assets/Icons/response_1749577005111.json', // Remove test data
      'mobile/src/Assets/Icons/response_1749577524579.json', // Remove test data
      'mobile/src/Assets/Icons/Mobile.pdf', // Move to docs
      'mobile/src/Assets/Icons/Mobile_App_Status_Update.docx', // Move to docs
      'mobile/src/Assets/Icons/mobile_App.docx' // Move to docs
    ];
    
    for (const file of duplicates) {
      const filePath = path.join(this.rootDir, file);
      try {
        await fs.access(filePath);
        
        // Move docs to proper location or delete
        if (file.endsWith('.pdf') || file.endsWith('.docx')) {
          const docsDir = path.join(this.rootDir, 'docs', 'mobile');
          await fs.mkdir(docsDir, { recursive: true });
          const fileName = path.basename(file);
          const newPath = path.join(docsDir, fileName.toLowerCase().replace(/ /g, '-'));
          await fs.rename(filePath, newPath);
          this.report.movedFiles.push({ from: file, to: newPath });
          console.log(`  📁 Moved: ${file} → docs/mobile/`);
        } else {
          await fs.unlink(filePath);
          this.report.deletedFiles.push(file);
          console.log(`  🗑️  Deleted: ${file}`);
        }
      } catch (error) {
        // File doesn't exist, skip
      }
    }
  }

  /**
   * Consolidate boilerplate components
   */
  async consolidateBoilerplates() {
    console.log('\n🔄 Consolidating boilerplate components...');
    
    const boilerplates = [
      'AddCrmProfileTabBoilerPlate',
      'CrmProfileVehicleBoilerPlate',
      'PaymentMethodBoilerPlate'
    ];
    
    for (const name of boilerplates) {
      const oldPath = path.join(this.rootDir, 'mobile', 'src', 'Screens', name);
      const newName = name.replace('BoilerPlate', 'Template');
      const newPath = path.join(this.rootDir, 'mobile', 'src', 'templates', newName);
      
      try {
        await fs.access(oldPath);
        await fs.mkdir(path.dirname(newPath), { recursive: true });
        
        // Move to templates directory
        await this.moveDirectory(oldPath, newPath);
        this.report.movedFiles.push({ from: oldPath, to: newPath });
        console.log(`  ✅ Moved: ${name} → templates/${newName}`);
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
  }

  /**
   * Move directory recursively
   */
  async moveDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.moveDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
    
    // Remove source after successful copy
    await fs.rm(src, { recursive: true, force: true });
  }

  /**
   * Update .gitignore
   */
  async updateGitignore() {
    console.log('\n📝 Updating .gitignore...');
    
    const gitignorePath = path.join(this.rootDir, '.gitignore');
    const additions = [
      '\n# Legacy directories (deleted)',
      'frontend-temp/',
      'DCAP/',
      '',
      '# Test artifacts',
      'coverage/',
      '*.lcov',
      '.nyc_output/',
      'test-results/',
      '',
      '# Performance reports',
      'performance-reports/',
      'bundle-analysis/',
      'lighthouse-results/',
      '',
      '# IDE',
      '.idea/',
      '.vscode/settings.json',
      '*.swp',
      '*.swo',
      '',
      '# OS files',
      '.DS_Store',
      'Thumbs.db',
      'desktop.ini'
    ];
    
    try {
      let content = await fs.readFile(gitignorePath, 'utf8');
      
      // Check if already updated
      if (!content.includes('# Legacy directories')) {
        content += '\n' + additions.join('\n');
        await fs.writeFile(gitignorePath, content);
        console.log('  ✅ Updated .gitignore');
      }
    } catch (error) {
      this.report.errors.push(`Gitignore update error: ${error.message}`);
    }
  }

  /**
   * Verify no large files
   */
  async checkLargeFiles() {
    console.log('\n📊 Checking for large files (>300 LOC)...');
    
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const largeFiles = [];
    
    async function checkDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip node_modules and other directories
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await checkDirectory(fullPath);
          }
        } else if (extensions.includes(path.extname(entry.name))) {
          const content = await fs.readFile(fullPath, 'utf8');
          const lines = content.split('\n').length;
          
          if (lines > 300) {
            largeFiles.push({
              file: fullPath.replace(process.cwd(), ''),
              lines
            });
          }
        }
      }
    }
    
    try {
      await checkDirectory(this.rootDir);
      
      if (largeFiles.length > 0) {
        console.log('  ⚠️  Files exceeding 300 LOC:');
        largeFiles.forEach(({ file, lines }) => {
          console.log(`     - ${file} (${lines} lines)`);
        });
      } else {
        console.log('  ✅ All files under 300 LOC');
      }
    } catch (error) {
      this.report.errors.push(`Large file check error: ${error.message}`);
    }
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n📋 Cleanup Report:');
    console.log('==================');
    console.log(`  Renamed files: ${this.report.renamedFiles.length}`);
    console.log(`  Deleted files: ${this.report.deletedFiles.length}`);
    console.log(`  Moved files: ${this.report.movedFiles.length}`);
    console.log(`  Errors: ${this.report.errors.length}`);
    
    // Save detailed report
    const reportPath = path.join(this.rootDir, 'cleanup-report.json');
    fs.writeFile(reportPath, JSON.stringify(this.report, null, 2))
      .then(() => console.log(`\n  Full report saved to: cleanup-report.json`))
      .catch(error => console.error(`  Error saving report: ${error.message}`));
  }

  /**
   * Run all cleanup tasks
   */
  async run() {
    console.log('🚀 Starting repository cleanup...');
    console.log('==================================');
    
    await this.cleanAssetNames();
    await this.removeDuplicates();
    await this.consolidateBoilerplates();
    await this.updateGitignore();
    await this.checkLargeFiles();
    
    this.generateReport();
    
    console.log('\n✅ Cleanup complete!');
    console.log('\nNext steps:');
    console.log('  1. Review cleanup-report.json');
    console.log('  2. Run tests to ensure nothing broke');
    console.log('  3. Commit changes');
  }
}

// Run cleanup
const cleaner = new RepositoryCleaner();
cleaner.run().catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});