const fs = require('fs');
const path = require('path');

// Directory containing assets with problematic names
const assetsDir = path.join(__dirname, '../src/Assets/Icons');

// Function to clean file names
function cleanFileName(fileName) {
  // Get file extension
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  // Clean the base name
  let cleanName = baseName
    // Remove special characters except underscore and hyphen
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    // Replace multiple underscores with single underscore
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
    // Convert to camelCase
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  
  // Make first letter lowercase for consistency
  cleanName = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
  
  return cleanName + ext;
}

// Get all files in the directory
const files = fs.readdirSync(assetsDir);

// Track renamed files
const renamedFiles = [];
const errors = [];

files.forEach(file => {
  const oldPath = path.join(assetsDir, file);
  
  // Skip if it's a directory
  if (fs.statSync(oldPath).isDirectory()) {
    return;
  }
  
  // Clean the file name
  const cleanedName = cleanFileName(file);
  
  // Skip if name doesn't need cleaning
  if (file === cleanedName) {
    return;
  }
  
  const newPath = path.join(assetsDir, cleanedName);
  
  try {
    // Check if target file already exists
    if (fs.existsSync(newPath)) {
      errors.push(`Cannot rename ${file} to ${cleanedName}: file already exists`);
      return;
    }
    
    // Rename the file
    fs.renameSync(oldPath, newPath);
    renamedFiles.push({ old: file, new: cleanedName });
    console.log(`✓ Renamed: ${file} → ${cleanedName}`);
  } catch (error) {
    errors.push(`Failed to rename ${file}: ${error.message}`);
  }
});

// Update icn.ts file with new names
if (renamedFiles.length > 0) {
  const icnPath = path.join(__dirname, '../src/Assets/icn.ts');
  
  if (fs.existsSync(icnPath)) {
    let icnContent = fs.readFileSync(icnPath, 'utf8');
    
    renamedFiles.forEach(({ old, new: newName }) => {
      // Update require statements
      const oldRequire = `require('./Icons/${old}')`;
      const newRequire = `require('./Icons/${newName}')`;
      icnContent = icnContent.replace(oldRequire, newRequire);
    });
    
    fs.writeFileSync(icnPath, icnContent);
    console.log('✓ Updated icn.ts file');
  }
}

// Summary
console.log('\n=== Summary ===');
console.log(`Files renamed: ${renamedFiles.length}`);
if (errors.length > 0) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach(error => console.log(`  - ${error}`));
}

// Export renamed files for reference
if (renamedFiles.length > 0) {
  const mappingPath = path.join(__dirname, 'asset-rename-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(renamedFiles, null, 2));
  console.log(`\nRename mapping saved to: ${mappingPath}`);
}