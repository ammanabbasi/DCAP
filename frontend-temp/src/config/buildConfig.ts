import { NativeModules, Platform } from 'react-native';

// Get build config from native Android BuildConfig
const getBuildConfig = (): any => {
  if (Platform.OS === 'android') {
    const { BuildConfig } = NativeModules;
    return BuildConfig || {};
  }
  return {};
};

const buildConfig = getBuildConfig();

// Production-safe configuration
export const CONFIG = {
  // API endpoints from BuildConfig (set in build.gradle)
  API_BASE_URL: buildConfig.API_BASE_URL || 'https://dcrnapi.azurewebsites.net/api/',
  SOCKET_URL: buildConfig.SOCKET_URL || 'https://dcrnapi.azurewebsites.net',
  
  // Build information
  BUILD_TYPE: buildConfig.BUILD_TYPE || 'release',
  IS_DEBUG: buildConfig.BUILD_TYPE === 'debug',
  IS_PRODUCTION: buildConfig.BUILD_TYPE === 'release',
  
  // Feature flags
  ENABLE_FLIPPER: buildConfig.BUILD_TYPE === 'debug',
  ENABLE_LOGGING: buildConfig.BUILD_TYPE !== 'release',
  
  // App information
  VERSION_CODE: buildConfig.VERSION_CODE || 1,
  VERSION_NAME: buildConfig.VERSION_NAME || '1.0.0',
  APPLICATION_ID: buildConfig.APPLICATION_ID || 'com.dealervait',
};

// Production-safe logger
export const Logger = {
  log: (...args: any[]) => {
    if (CONFIG.ENABLE_LOGGING) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (CONFIG.ENABLE_LOGGING) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(...args); // Always log warnings
  },
  error: (...args: any[]) => {
    console.error(...args); // Always log errors
  },
};

export default CONFIG;
