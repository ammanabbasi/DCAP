@echo off
echo 🔧 DealerVait Complete Fix and Testing Solution
echo.

REM Set environment variables
set ANDROID_HOME=C:\Users\amman\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator

echo ✅ Setting environment variables...
echo    ANDROID_HOME: %ANDROID_HOME%

REM Aggressive Gradle clean
echo.
echo 🧹 Fixing Gradle cache issues...

REM Stop any Gradle daemons
cd android
gradlew --stop 2>nul
echo ✅ Stopped Gradle daemons

REM Delete build directories
rmdir /s /q build 2>nul
rmdir /s /q app\build 2>nul
rmdir /s /q .gradle 2>nul
echo ✅ Deleted build directories

REM Delete node_modules and reinstall (fresh start)
cd ..
rmdir /s /q node_modules 2>nul
echo ✅ Deleted node_modules

echo.
echo 📦 Reinstalling dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

echo.
echo 🔨 Attempting fresh build...
cd android
gradlew clean
if %errorlevel% neq 0 (
    echo ⚠️  Clean failed, but continuing...
)

echo.
echo 📱 Testing Options:
echo.
echo 1. Physical Device Testing (Connect Android phone via USB)
echo 2. Emulator Testing (Requires Android Studio AVD)
echo 3. Build APK for manual testing
echo 4. Just start Metro bundler
echo.

set /p choice=Choose option (1-4): 

if "%choice%"=="1" goto :device_test
if "%choice%"=="2" goto :emulator_test
if "%choice%"=="3" goto :build_apk
if "%choice%"=="4" goto :metro_only

:device_test
echo.
echo 📱 Device Testing Instructions:
echo.
echo BEFORE RUNNING:
echo 1. Enable Developer Options on Android phone (Settings → About → Tap Build Number 7 times)
echo 2. Enable USB Debugging (Settings → Developer Options → USB Debugging)
echo 3. Connect phone via USB cable
echo 4. Allow USB debugging when prompted
echo.

pause

echo Testing device connection...
adb devices
echo.

echo Starting Metro bundler in background...
start "" cmd /c "cd .. && npm start"

timeout /t 5 >nul

echo Building and installing app...
cd ..
npm run android

goto :end

:emulator_test
echo.
echo 🖥️  Starting Android Emulator...
echo.

REM List available emulators
emulator -list-avds

echo.
echo Starting Metro bundler...
start "" cmd /c "npm start"

timeout /t 3 >nul

echo Building and running on emulator...
cd ..
npm run android

goto :end

:build_apk
echo.
echo 🔨 Building Release APK...
echo.

gradlew assembleDebug
if %errorlevel% equ 0 (
    echo.
    echo ✅ APK Built Successfully!
    echo Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo You can install this APK directly on any Android device.
) else (
    echo ❌ Build failed
)

goto :end

:metro_only
echo.
echo 🌐 Starting Metro Bundler...
echo.
echo Metro will start and wait for device connections.
echo In another terminal, you can run: npm run android
echo.

cd ..
npm start

goto :end

:end
echo.
echo 🎯 Next Steps:
echo - If testing worked: Great! You're ready to develop
echo - If issues persist: Try running individual commands manually
echo - For production build: Use scripts\build-release.bat
echo.
pause
