module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    // Remove console.log statements in production
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
  env: {
    production: {
      plugins: [
        // Additional production optimizations
        ['transform-remove-console', { exclude: ['error', 'warn', 'info'] }],
        'transform-react-remove-prop-types',
      ],
    },
    development: {
      plugins: [
        // Keep console.log in development
        // Add development-specific plugins here if needed
      ],
    },
  },
};