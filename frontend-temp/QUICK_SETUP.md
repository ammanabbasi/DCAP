# 🚀 Quick Setup Guide for DealerVait

## Android SDK Missing - Here's How to Fix It

### Option 1: Install Android Studio (Recommended - 15 minutes)

1. **Download Android Studio**: https://developer.android.com/studio
2. **Install Android Studio** with default settings
3. **Open Android Studio** → Configure → SDK Manager
4. **Install these components**:
   - Android SDK Platform 34 (Android 14)
   - Android SDK Platform 23 (minimum)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

5. **Note the SDK Location** (usually `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`)

### Option 2: Command Line Tools Only (Advanced - 10 minutes)

Download just the command line tools if you don't want the full IDE:

1. Go to: https://developer.android.com/studio#command-tools
2. Download "Command line tools only" for Windows
3. Create folder: `C:\Android\Sdk\cmdline-tools\latest`
4. Extract zip contents to the `latest` folder
5. Run: `C:\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat "platform-tools" "platforms;android-34" "build-tools;34.0.0"`

### Option 3: Quick Test Setup (2 minutes)

If you just want to test the current setup without Android development:

1. We'll use React Native Web or Expo Go for quick testing
2. Skip Android SDK for now

---

## After Installing Android SDK

Run this command to complete setup:
```bash
# Windows
scripts\complete-setup.bat

# Or manually set environment variable:
# ANDROID_HOME = C:\Users\[USERNAME]\AppData\Local\Android\Sdk
```

## Quick Test Options

### 1. Test on Physical Device (Easiest)
- Enable Developer Options on Android phone
- Enable USB Debugging
- Connect via USB
- Run: `npm run android`

### 2. Test in Browser (No SDK needed)
- Run: `npx expo start --web`
- Opens in browser immediately

### 3. Test with Expo Go App
- Install Expo Go from Play Store
- Run: `npx expo start`
- Scan QR code with Expo Go

Choose your preferred option and I'll guide you through it!
