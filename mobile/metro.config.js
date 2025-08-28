const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    // Minify for production
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_keys: true,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      warnings: false,
    },
  },
  resolver: {
    // Asset extensions
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'db',
      'mp3',
      'ttf',
      'obj',
      'png',
      'jpg',
      'jpeg',
      'gif',
      'svg',
      'pdf',
    ],
    // Source extensions
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'jsx',
      'js',
      'ts',
      'tsx',
      'json',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);