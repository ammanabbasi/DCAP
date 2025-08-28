@echo off
echo Setting up Android development environment for DealerVait...

REM Check if ANDROID_HOME is set
if "%ANDROID_HOME%"=="" (
    echo.
    echo ANDROID_HOME environment variable is not set!
    echo.
    echo Please set ANDROID_HOME to your Android SDK location.
    echo Common locations:
    echo   - C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo   - C:\Android\Sdk
    echo   - D:\Android\Sdk
    echo.
    echo To set ANDROID_HOME:
    echo 1. Open System Properties ^(Win + Pause^)
    echo 2. Click "Advanced system settings"
    echo 3. Click "Environment Variables"
    echo 4. Add new system variable:
    echo    Variable name: ANDROID_HOME
    echo    Variable value: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo.
    pause
    goto :end
)

REM Check if Android SDK exists
if not exist "%ANDROID_HOME%" (
    echo.
    echo Android SDK not found at: %ANDROID_HOME%
    echo Please install Android Studio or Android SDK Tools
    echo.
    pause
    goto :end
)

REM Update PATH to include Android tools
set PATH=%ANDROID_HOME%\emulator;%PATH%
set PATH=%ANDROID_HOME%\platform-tools;%PATH%
set PATH=%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%

echo.
echo Environment setup complete!
echo ANDROID_HOME: %ANDROID_HOME%
echo.
echo Available tools:
adb version 2>nul && echo - ADB: Available || echo - ADB: Not found
emulator -version 2>nul && echo - Emulator: Available || echo - Emulator: Not found

echo.
echo You can now run:
echo   npm install
echo   npm run android
echo.

:end
pause
