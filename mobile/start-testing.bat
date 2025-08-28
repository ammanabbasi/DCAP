@echo off
echo ===================================================
echo    DealerVait CRASH-DRIVEN TESTING Launcher
echo ===================================================
echo.
echo 🎯 PRACTICAL TESTING APPROACH:
echo    Test Now → Find Crashes → Fix What Breaks → Type What You Fix
echo.
echo 📋 BEFORE YOU START:
echo    1. Have RUNTIME_BUGS.md open to document crashes
echo    2. Test with REAL dealership workflows
echo    3. Screenshot any errors you encounter
echo    4. Focus on business-critical features first
echo.
echo ⚡ Starting DealerVait React Native App for REAL testing...
echo.
echo 🧹 Cleaning Metro cache...
npx metro-cache-clean
echo.
echo 🚀 Starting Metro bundler with clean cache...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
echo.
echo ⏳ Waiting 10 seconds for bundler to start...
timeout /t 10 /nobreak >nul
echo.
echo 📱 Launching app on Android emulator...
npx react-native run-android
echo.
echo ✅ DealerVait app launching for CRASH-DRIVEN TESTING!
echo.
echo 🎯 TESTING PRIORITIES:
echo    1. Login with test credentials (aitest / 1234)
echo    2. Navigate through main workflows
echo    3. Document EVERY crash in RUNTIME_BUGS.md
echo    4. Focus on: Inventory → Customers → Financial operations
echo.
echo 📊 Monitor Metro Bundler for JavaScript errors
echo 📱 Test on actual device for best results
echo 🐛 Document crashes as you find them
echo.
echo 🚀 READY TO FIND AND FIX REAL BUGS!
echo Press any key to close this window...
pause >nul
