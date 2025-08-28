const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== TYPESCRIPT ERROR COUNT VERIFICATION ===');

try {
  console.log('1. Checking TypeScript version...');
  const version = execSync('npx tsc --version', { encoding: 'utf8' });
  console.log('TypeScript version:', version.trim());

  console.log('2. Running TypeScript compilation...');
  const result = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('TypeScript compilation result: SUCCESS (no errors)');
  console.log('EXACT ERROR COUNT: 0');

} catch (error) {
  console.log('TypeScript compilation found errors:');
  const stderr = error.stderr || '';
  const stdout = error.stdout || '';
  const output = stderr + stdout;
  
  const errorLines = output.split('\n').filter(line => line.includes('error TS'));
  console.log('EXACT ERROR COUNT:', errorLines.length);
  
  if (errorLines.length > 0) {
    console.log('\nFirst 10 errors:');
    errorLines.slice(0, 10).forEach((line, i) => {
      console.log(`${i + 1}. ${line.trim()}`);
    });
  }
}

console.log('3. Running strict TypeScript check...');
try {
  const strictResult = execSync('npx tsc --noEmit --strict', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('Strict TypeScript check: SUCCESS (no errors)');
} catch (error) {
  const stderr = error.stderr || '';
  const stdout = error.stdout || '';
  const output = stderr + stdout;
  
  const errorLines = output.split('\n').filter(line => line.includes('error TS'));
  console.log('Strict mode errors found:', errorLines.length);
}

console.log('=== VERIFICATION COMPLETE ===');
