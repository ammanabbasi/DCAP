@echo off
echo 🚀 DealerVait React Native Testing
echo.

echo This will start the React Native development server.
echo.

echo Available Testing Options:
echo.
echo 1. 📱 Test on Physical Android Device (USB)
echo 2. 🖥️  Test on Android Emulator  
echo 3. 🌐 Start Metro Bundler Only
echo 4. 🔧 Setup Android SDK First
echo.

set /p choice=Choose option (1-4): 

if "%choice%"=="1" goto :physical_device
if "%choice%"=="2" goto :emulator
if "%choice%"=="3" goto :metro_only
if "%choice%"=="4" goto :setup_sdk
echo Invalid choice.
goto :end

:physical_device
echo.
echo 📱 Testing on Physical Device...
echo.
echo BEFORE CONNECTING:
echo 1. Enable Developer Options on your Android phone
echo 2. Enable USB Debugging 
echo 3. Connect phone via USB
echo 4. Allow USB Debugging when prompted
echo.

echo Starting Metro bundler...
start cmd /k "npm start"

timeout /t 3 >nul

echo Installing and running on device...
npm run android

goto :end

:emulator
echo.
echo 🖥️  Testing on Android Emulator...
echo.
echo This requires Android Studio with an AVD (Android Virtual Device) set up.
echo.
echo Starting Metro bundler...
start cmd /k "npm start"

timeout /t 3 >nul

echo Starting app on emulator...
npm run android

goto :end

:metro_only
echo.
echo 🌐 Starting Metro Bundler...
echo.
echo The bundler will start and wait for a device connection.
echo You can then:
echo 1. Connect a device and run: npm run android
echo 2. Start an emulator and run: npm run android
echo.

npm start
goto :end

:setup_sdk
echo.
echo 🔧 Setting up Android SDK...
echo.
echo Running Android SDK setup...
call scripts\complete-setup.bat
goto :end

:end
