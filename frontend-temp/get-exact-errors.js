const { execSync } = require('child_process');

console.log('=== GETTING EXACT TYPESCRIPT ERROR COUNT ===');

try {
  // Run TypeScript compilation and capture all output
  const result = execSync('npx tsc --noEmit', { 
    encoding: 'utf8', 
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 60000
  });
  
  console.log('✅ NO TYPESCRIPT ERRORS FOUND!');
  console.log('EXACT ERROR COUNT: 0');
  
} catch (error) {
  console.log('TypeScript compilation errors detected:');
  
  const stdout = error.stdout || '';
  const stderr = error.stderr || '';
  const output = stdout + stderr;
  
  // Extract error lines
  const errorLines = output.split('\n').filter(line => 
    line.includes('error TS') || line.includes('Found ')
  );
  
  // Count actual errors
  const actualErrors = output.split('\n').filter(line => 
    line.includes('error TS')
  );
  
  console.log('EXACT ERROR COUNT:', actualErrors.length);
  
  // Show summary line if exists
  const summaryLine = errorLines.find(line => line.includes('Found '));
  if (summaryLine) {
    console.log('Summary:', summaryLine.trim());
  }
  
  // Show first 10 errors for analysis
  if (actualErrors.length > 0) {
    console.log('\nFirst 10 errors:');
    actualErrors.slice(0, 10).forEach((error, i) => {
      console.log(`${i + 1}. ${error.trim()}`);
    });
  }
  
  // Write all errors to file for analysis
  require('fs').writeFileSync('current_errors.txt', output);
  console.log('\nAll errors written to current_errors.txt');
}

console.log('=== ERROR COUNT COMPLETE ===');
