const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Optimized Metro configuration for performance
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Serializer configuration for bundle optimization
  serializer: {
    // Create separate bundles for better performance
    createModuleIdFactory: function () {
      return function (path) {
        // Use shorter, more predictable module IDs
        return path
          .replace(/^.*\/node_modules\//, '')
          .replace(/\//g, '-')
          .replace(/\.[jt]sx?$/, '')
          .replace(/[^a-zA-Z0-9-_]/g, '');
      };
    },
    // Bundle splitting configuration
    processModuleFilter: function (modules) {
      const { preloadedModules, ramGroups } = modules;
      // Split large modules into separate chunks
      return {
        preloadedModules,
        ramGroups: ramGroups.filter((group) => group.length > 10),
      };
    },
    // Optimize output
    getRunModuleStatement: (moduleId) =>
      `__r(${JSON.stringify(moduleId)});`,
  },
  
  transformer: {
    // Advanced minification for production builds
    minifierConfig: {
      // Tree shaking and dead code elimination
      mangle: {
        keep_fnames: false, // More aggressive mangling
        reserved: ['$', 'require', '__d', '__r'], // Keep essential RN globals
      },
      compress: {
        // Enable advanced compression
        drop_console: !__DEV__, // Remove console.* in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3, // Multiple compression passes
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
      },
      output: {
        ascii_only: true,
        quote_keys: false, // More compact output
        wrap_iife: true,
        beautify: false,
        comments: false, // Remove comments
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      warnings: false,
    },
    // Babel configuration for optimization
    babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
    // Enable inline requires for better tree shaking
    inlineRequires: true,
    // Optimize imports
    unstable_allowRequireContext: true,
  },
  
  resolver: {
    // Asset extensions with optimization flags
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'db', 'mp3', 'ttf', 'obj',
      'png', 'jpg', 'jpeg', 'gif', 'svg', 'pdf', 'webp',
    ],
    // Source extensions
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'jsx', 'js', 'ts', 'tsx', 'json',
    ],
    // Alias for common modules to reduce bundle duplication
    alias: {
      'react-native-vector-icons': 'react-native-vector-icons/dist',
    },
    // Platform-specific extensions for better tree shaking
    platforms: ['native', 'android', 'ios', 'web'],
  },
  
  // Caching optimization
  cacheStores: [
    {
      name: 'file-cache',
      get: require('metro-cache/src/stores/FileStore'),
    },
  ],
  
  // Maximum workers for faster builds
  maxWorkers: require('os').cpus().length,
  
  // Watch mode optimization
  watchFolders: [],
  
  // Reset cache on dependency changes
  resetCache: false,
  
  // Custom project configuration
  projectRoot: __dirname,
  
  // Experimental features for performance
  experimental: {
    // Enable experimental bundle splitting
    enableBundleSplitting: false, // Enable when stable
  },
};

module.exports = mergeConfig(defaultConfig, config);