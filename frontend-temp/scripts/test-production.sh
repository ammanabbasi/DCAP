#!/bin/bash

# DealerVait Production Testing Script
# Tests the production build on connected devices

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
PACKAGE_NAME="com.dealervait"

print_step() {
    echo -e "\n${GREEN}➤ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${BLUE}🧪 DealerVait Production Testing${NC}"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    print_error "APK not found at $APK_PATH"
    echo "Please run the build script first: ./scripts/build-release.sh"
    exit 1
fi

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    print_error "ADB not found. Please install Android SDK platform-tools."
    exit 1
fi

print_step "Checking connected devices..."
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)

if [ $DEVICES -eq 0 ]; then
    print_error "No devices connected. Please connect an Android device with USB debugging enabled."
    exit 1
fi

echo -e "${GREEN}✅ Found $DEVICES connected device(s)${NC}"

# List devices
adb devices

print_step "Installing production APK..."

# Uninstall existing app first
adb uninstall $PACKAGE_NAME 2>/dev/null || echo "App not previously installed"

# Install new APK
adb install "$APK_PATH"

print_step "Verifying installation..."
if adb shell pm list packages | grep -q $PACKAGE_NAME; then
    echo -e "${GREEN}✅ App installed successfully${NC}"
else
    print_error "App installation failed"
    exit 1
fi

print_step "Checking app info..."
adb shell dumpsys package $PACKAGE_NAME | grep -E "versionCode|versionName|targetSdk" | head -3

print_step "Testing app launch..."
adb shell am start -n $PACKAGE_NAME/.MainActivity

# Wait a moment for app to start
sleep 3

# Check if app is running
if adb shell ps | grep -q $PACKAGE_NAME; then
    echo -e "${GREEN}✅ App launched successfully${NC}"
else
    print_warning "App may not have launched properly"
fi

print_step "Collecting app logs (last 50 lines)..."
echo "Recent logs from the app:"
adb logcat -t 50 | grep -i "dealervait\|error\|crash" || echo "No recent logs found"

print_step "Testing basic functionality..."

echo -e "\n${YELLOW}📱 Manual Testing Checklist:${NC}"
echo "1. ✅ App launches without crash"
echo "2. ⏳ Login screen loads properly"
echo "3. ⏳ Network requests work with live API"
echo "4. ⏳ Navigation between screens"
echo "5. ⏳ Camera functionality (if available)"
echo "6. ⏳ File upload/download"
echo "7. ⏳ Data persistence"
echo "8. ⏳ Push notifications (if implemented)"

echo -e "\n${YELLOW}🔍 Performance Testing:${NC}"
echo "- Monitor app startup time"
echo "- Check memory usage in Settings > Apps > DealerVait > Storage"
echo "- Test on different screen sizes"
echo "- Test with poor network connection"

echo -e "\n${YELLOW}♿ Accessibility Testing:${NC}"
echo "- Enable TalkBack in Settings > Accessibility"
echo "- Test navigation with screen reader"
echo "- Check color contrast in Settings > Accessibility > Color"

print_step "Automated crash detection..."
# Check for crashes in the last few minutes
CRASH_LOGS=$(adb logcat -t 100 | grep -i "crash\|fatal\|exception" | grep $PACKAGE_NAME || echo "")
if [ -n "$CRASH_LOGS" ]; then
    print_error "Potential crashes detected:"
    echo "$CRASH_LOGS"
else
    echo -e "${GREEN}✅ No crashes detected in recent logs${NC}"
fi

echo -e "\n${GREEN}🎯 Testing Commands:${NC}"
echo "View live logs: adb logcat | grep DealerVait"
echo "Monitor performance: adb shell top | grep $PACKAGE_NAME"
echo "Check network activity: adb shell netstat | grep $PACKAGE_NAME"
echo "Force stop app: adb shell am force-stop $PACKAGE_NAME"
echo "Clear app data: adb shell pm clear $PACKAGE_NAME"

echo -e "\n${BLUE}📊 Testing Complete!${NC}"
echo "Please manually verify all functionality before submitting to Play Store."
