@echo off
echo 🧪 DealerVait Testing - No Android SDK Required
echo.

echo This script provides testing options that don't require Android SDK setup.
echo.

echo Available Testing Options:
echo.
echo 1. 🌐 Web Browser Testing (React Native Web)
echo 2. 📱 Expo Go Testing (on your phone)
echo 3. 🔧 Setup Android SDK for device testing
echo.

set /p choice=Choose option (1-3): 

if "%choice%"=="1" goto :web_test
if "%choice%"=="2" goto :expo_test
if "%choice%"=="3" goto :android_setup
echo Invalid choice. Please choose 1, 2, or 3.
goto :end

:web_test
echo.
echo 🌐 Starting Web Browser Test...
echo.
echo This will:
echo 1. Install dependencies
echo 2. Start development server
echo 3. Open DealerVait in your browser
echo.

npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    goto :end
)

echo ✅ Dependencies installed
echo 🚀 Starting development server...
echo.
echo The app will open in your browser automatically.
echo Press Ctrl+C to stop the server.
echo.

REM Try to start web version
npx expo start --web
goto :end

:expo_test
echo.
echo 📱 Starting Expo Go Test...
echo.
echo This will:
echo 1. Install dependencies
echo 2. Start Expo development server
echo 3. Show QR code for Expo Go app
echo.

npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    goto :end
)

echo ✅ Dependencies installed
echo.
echo 📋 Instructions:
echo 1. Install "Expo Go" app from Google Play Store
echo 2. Scan the QR code that appears
echo 3. DealerVait will load on your phone
echo.
echo 🚀 Starting Expo server...

npx expo start
goto :end

:android_setup
echo.
echo 🔧 Android SDK Setup Required
echo.
echo To test on Android devices/emulators, you need Android SDK.
echo.
echo Quick setup:
echo 1. Download Android Studio: https://developer.android.com/studio
echo 2. Install with default settings
echo 3. Run: scripts\complete-setup.bat
echo.
echo Or use Option 1 or 2 for immediate testing!
echo.

:end
pause
