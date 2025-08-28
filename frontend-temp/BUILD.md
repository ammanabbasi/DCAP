# DealerVait Build Guide

## Overview

This guide provides step-by-step instructions for building production-ready APK and AAB files for the DealerVait mobile application.

## Prerequisites

### Required Software
- **Node.js** 18+ with npm/yarn
- **Android Studio** with SDK Tools
- **JDK 17** (recommended for React Native 0.75+)
- **Git** for version control

### Required Environment Variables
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# For versioning (optional)
export VERSION_CODE=1
export VERSION_NAME="1.0.0"
```

### Production Keystore Setup

1. **Generate Production Keystore** (ONE TIME ONLY):
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore dealervait-upload-key.keystore -alias dealervait-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure gradle.properties**:
```bash
cp android/gradle.properties.example android/gradle.properties
# Edit android/gradle.properties with your keystore details:
DEALERVAIT_UPLOAD_STORE_FILE=dealervait-upload-key.keystore
DEALERVAIT_UPLOAD_KEY_ALIAS=dealervait-key-alias  
DEALERVAIT_UPLOAD_STORE_PASSWORD=your-store-password
DEALERVAIT_UPLOAD_KEY_PASSWORD=your-key-password
```

⚠️ **IMPORTANT**: Never commit `android/gradle.properties` to version control!

## Quick Build Commands

### Automated Build (Recommended)
```bash
# Make script executable (first time only)
chmod +x scripts/build-release.sh

# Build both APK and AAB
./scripts/build-release.sh

# Build and copy to output directory
./scripts/build-release.sh --copy-output
```

### Manual Build Steps

1. **Install Dependencies**:
```bash
npm install
# or
yarn install
```

2. **Clean Previous Builds**:
```bash
cd android
./gradlew clean
cd ..
```

3. **Build JavaScript Bundle**:
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
```

4. **Build Release APK**:
```bash
cd android
./gradlew assembleRelease
cd ..
```

5. **Build Release AAB** (Google Play Store):
```bash
cd android
./gradlew bundleRelease
cd ..
```

## Build Outputs

### APK Location
```
android/app/build/outputs/apk/release/app-release.apk
```

### AAB Location (Preferred for Play Store)
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Build Variants

### Debug Build
```bash
cd android
./gradlew assembleDebug
```

### Staging Build
```bash
cd android
./gradlew assembleStaging
```

### Release Build
```bash
cd android
./gradlew assembleRelease
```

## Verification

### Verify APK Signature
```bash
# Using apksigner (if available)
apksigner verify android/app/build/outputs/apk/release/app-release.apk

# Using jarsigner
jarsigner -verify -verbose android/app/build/outputs/apk/release/app-release.apk
```

### Check APK Contents
```bash
# List contents
aapt dump badging android/app/build/outputs/apk/release/app-release.apk

# Check size
du -h android/app/build/outputs/apk/release/app-release.apk
```

## Testing Production Build

### Install on Device
```bash
# Make test script executable
chmod +x scripts/test-production.sh

# Run automated testing
./scripts/test-production.sh
```

### Manual Testing
```bash
# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Launch app
adb shell am start -n com.dealervait/.MainActivity

# Monitor logs
adb logcat | grep DealerVait
```

## Troubleshooting

### Common Build Errors

#### Java Version Issues
```bash
# Check Java version
java -version

# Should be JDK 17 for React Native 0.75+
```

#### Gradle Issues
```bash
# Clear Gradle cache
cd android
./gradlew clean
./gradlew --stop
cd ..

# Delete node modules and reinstall
rm -rf node_modules
npm install
```

#### Memory Issues
```bash
# Increase Gradle memory in android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

#### Permission Issues
```bash
# Fix gradlew permissions
chmod +x android/gradlew
```

### Build Optimization

#### Reduce APK Size
- Enable ProGuard/R8 (already configured)
- Use AAB instead of APK for Play Store
- Enable resource shrinking (already configured)
- Use ABI splits (already configured)

#### Improve Build Speed
- Use Gradle daemon (already configured)
- Enable parallel builds (already configured)
- Use incremental builds

## Continuous Integration

### GitHub Actions (Example)
```yaml
name: Build Android Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Setup JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Install dependencies
        run: npm ci
      - name: Build release
        env:
          VERSION_CODE: ${{ github.run_number }}
          VERSION_NAME: ${{ github.ref_name }}
        run: ./scripts/build-release.sh
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: release-builds
          path: |
            android/app/build/outputs/apk/release/
            android/app/build/outputs/bundle/release/
```

## Security Checklist

- [ ] Production keystore generated and secured
- [ ] Debug keystore removed from release config
- [ ] gradle.properties excluded from version control
- [ ] ProGuard/R8 enabled and configured
- [ ] Network security config implemented
- [ ] Debug flags disabled in manifest

## Next Steps

1. Test APK on multiple devices
2. Upload AAB to Google Play Console
3. Configure Play Store listing
4. Submit for review

For more information, see [RELEASE.md](./RELEASE.md) for deployment procedures.
