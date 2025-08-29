module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.{css,scss,less}': ['prettier --write'],
  
  // Backend specific rules
  'backend/**/*.{js,ts}': [
    'cd backend && npm run lint:fix',
    'cd backend && npm run typecheck',
  ],
  
  // Web specific rules
  'web/**/*.{js,jsx,ts,tsx}': [
    'cd web && npm run lint:fix',
    'cd web && npm run typecheck',
  ],
  
  // Mobile specific rules
  'mobile/**/*.{js,jsx,ts,tsx}': [
    'cd mobile && npm run lint:fix',
    'cd mobile && npm run typecheck',
  ],
  
  // Shared package rules
  'shared/**/*.{js,ts}': [
    'cd shared && npm run lint:fix',
    'cd shared && npm run typecheck',
    'cd shared && npm run build', // Ensure shared package builds
  ],
  
  // Run tests for changed files
  'backend/**/*.{js,ts}': [
    'cd backend && npm run test:changed',
  ],
  'web/**/*.{js,jsx,ts,tsx}': [
    'cd web && npm run test:changed',
  ],
  'shared/**/*.{js,ts}': [
    'cd shared && npm run test:changed',
  ],
}