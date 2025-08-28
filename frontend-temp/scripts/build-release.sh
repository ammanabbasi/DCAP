#!/bin/bash

# DealerVait Release Build Script
# This script builds a production-ready signed APK and AAB

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="DealerVait"
BUILD_DIR="android/app/build/outputs"
VERSION_CODE=${VERSION_CODE:-1}
VERSION_NAME=${VERSION_NAME:-"1.0.0"}

echo -e "${BLUE}🚀 Starting production build for $APP_NAME${NC}"
echo -e "${BLUE}📦 Version: $VERSION_NAME (Code: $VERSION_CODE)${NC}"

# Function to print step
print_step() {
    echo -e "\n${GREEN}➤ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Android project exists
if [ ! -d "android" ]; then
    print_error "Android directory not found. This doesn't appear to be a React Native project."
    exit 1
fi

print_step "Cleaning previous builds..."
cd android
./gradlew clean
cd ..

print_step "Installing/updating dependencies..."
if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile
else
    npm ci
fi

print_step "Running pre-build checks..."

# Check for common issues
if grep -r "console.log" src/ --exclude-dir=node_modules &> /dev/null; then
    print_warning "console.log statements found. These will be removed in production build."
fi

# Lint check
print_step "Running linter..."
if command -v yarn &> /dev/null; then
    yarn lint || print_warning "Linting issues found. Please fix before production release."
else
    npm run lint || print_warning "Linting issues found. Please fix before production release."
fi

# Test check  
print_step "Running tests..."
if command -v yarn &> /dev/null; then
    yarn test --watchAll=false || print_warning "Tests failed. Please fix before production release."
else
    npm test -- --watchAll=false || print_warning "Tests failed. Please fix before production release."
fi

print_step "Building JavaScript bundle..."
if command -v yarn &> /dev/null; then
    yarn react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
else
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
fi

print_step "Building release APK..."
cd android
export VERSION_CODE=$VERSION_CODE
export VERSION_NAME=$VERSION_NAME
./gradlew assembleRelease

print_step "Building release AAB (recommended for Play Store)..."
./gradlew bundleRelease

# Verify builds exist
APK_PATH="$BUILD_DIR/apk/release/app-release.apk"
AAB_PATH="$BUILD_DIR/bundle/release/app-release.aab"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${GREEN}✅ APK built successfully: $APK_PATH (Size: $APK_SIZE)${NC}"
else
    print_error "APK build failed!"
    exit 1
fi

if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo -e "${GREEN}✅ AAB built successfully: $AAB_PATH (Size: $AAB_SIZE)${NC}"
else
    print_error "AAB build failed!"
    exit 1
fi

# Verify APK signature
print_step "Verifying APK signature..."
if command -v apksigner &> /dev/null; then
    apksigner verify "$APK_PATH" && echo -e "${GREEN}✅ APK signature verified${NC}" || print_warning "APK signature verification failed"
fi

# Show build artifacts
print_step "Build artifacts:"
echo "📱 APK: $(pwd)/$APK_PATH"
echo "📦 AAB: $(pwd)/$AAB_PATH"

# Optional: Copy to output directory
if [ "$1" = "--copy-output" ]; then
    OUTPUT_DIR="../release-builds/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$OUTPUT_DIR"
    cp "$APK_PATH" "$OUTPUT_DIR/"
    cp "$AAB_PATH" "$OUTPUT_DIR/"
    echo -e "${GREEN}📁 Build artifacts copied to: $OUTPUT_DIR${NC}"
fi

cd ..

echo -e "\n${GREEN}🎉 Production build completed successfully!${NC}"
echo -e "${BLUE}📱 APK: android/$APK_PATH${NC}"
echo -e "${BLUE}📦 AAB: android/$AAB_PATH${NC}"
echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo "1. Test the APK on physical devices"
echo "2. Upload AAB to Google Play Console"
echo "3. Configure store listing and screenshots"
echo "4. Submit for review"

# Show warnings if any
if grep -q "debug" android/app/build.gradle; then
    print_warning "Debug keystore detected in build.gradle. Ensure production keystore is configured!"
fi
