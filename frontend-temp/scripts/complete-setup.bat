@echo off
echo 🚀 DealerVait Setup Completion Script
echo.

REM Try to find Android SDK automatically
set "SDK_FOUND="
set "SDK_PATH="

echo Looking for Android SDK...

REM Check common locations
if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    set "SDK_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
    set "SDK_FOUND=1"
    echo ✅ Found Android SDK at: !SDK_PATH!
    goto :setup_sdk
)

if exist "C:\Android\Sdk" (
    set "SDK_PATH=C:\Android\Sdk"
    set "SDK_FOUND=1"
    echo ✅ Found Android SDK at: !SDK_PATH!
    goto :setup_sdk
)

if exist "D:\Android\Sdk" (
    set "SDK_PATH=D:\Android\Sdk"
    set "SDK_FOUND=1"
    echo ✅ Found Android SDK at: !SDK_PATH!
    goto :setup_sdk
)

REM SDK not found
echo ❌ Android SDK not found automatically
echo.
echo Please install Android Studio first:
echo 1. Download from: https://developer.android.com/studio
echo 2. Install with default settings
echo 3. Open Android Studio and complete setup
echo 4. Run this script again
echo.
echo Or enter your SDK path manually:
set /p "MANUAL_PATH=Enter Android SDK path (or press Enter to skip): "

if not "%MANUAL_PATH%"=="" (
    if exist "%MANUAL_PATH%" (
        set "SDK_PATH=%MANUAL_PATH%"
        set "SDK_FOUND=1"
        echo ✅ Using provided SDK path: !SDK_PATH!
        goto :setup_sdk
    ) else (
        echo ❌ Path not found: %MANUAL_PATH%
        goto :no_sdk_options
    )
)

:no_sdk_options
echo.
echo 🔄 Alternative Testing Options:
echo.
echo 1. Install Android Studio and run this script again
echo 2. Test in browser: npm run web
echo 3. Test with Expo Go app on phone
echo.
echo Choose option 2 or 3 for immediate testing without Android SDK
pause
goto :end

:setup_sdk
echo.
echo 📝 Setting up Android SDK configuration...

REM Create local.properties with correct path
echo sdk.dir=%SDK_PATH:\=\\% > android\local.properties

echo ✅ Created android/local.properties

REM Set environment variables for current session
set "ANDROID_HOME=%SDK_PATH%"
set "PATH=%PATH%;%ANDROID_HOME%\emulator"
set "PATH=%PATH%;%ANDROID_HOME%\platform-tools"
set "PATH=%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin"

echo ✅ Set environment variables for current session

echo.
echo 📱 Testing Android SDK tools...

REM Test ADB
"%ANDROID_HOME%\platform-tools\adb.exe" version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ADB is working
) else (
    echo ⚠️  ADB not found - platform-tools may not be installed
)

echo.
echo 🎯 Next Steps:
echo.
echo For PERMANENT environment variables (required):
echo 1. Open System Properties (Win + Pause)
echo 2. Click "Advanced system settings"
echo 3. Click "Environment Variables"
echo 4. Add new system variable:
echo    Variable name: ANDROID_HOME
echo    Variable value: %SDK_PATH%
echo 5. Add to PATH: %%ANDROID_HOME%%\platform-tools
echo.
echo For IMMEDIATE testing (current session only):
echo   npm install
echo   npm run android
echo.
echo 📋 Setup Summary:
echo   ✅ Android SDK found at: %SDK_PATH%
echo   ✅ local.properties configured
echo   ✅ Environment variables set (current session)
echo   ⏳ Manual environment setup needed for permanence
echo.

:end
pause
