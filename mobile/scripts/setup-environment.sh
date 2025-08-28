#!/bin/bash

# DealerVait Android Environment Setup Script

echo "🚀 Setting up Android development environment for DealerVait..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    DEFAULT_SDK_PATH="$HOME/Library/Android/sdk"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    DEFAULT_SDK_PATH="$HOME/Android/Sdk"
else
    OS="Windows"
    DEFAULT_SDK_PATH="/c/Users/$USER/AppData/Local/Android/Sdk"
fi

print_info "Detected OS: $OS"

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    print_error "ANDROID_HOME environment variable is not set!"
    echo
    print_info "Please set ANDROID_HOME to your Android SDK location."
    print_info "Common location for $OS: $DEFAULT_SDK_PATH"
    echo
    print_info "To set ANDROID_HOME, add this to your shell profile:"
    echo "export ANDROID_HOME=$DEFAULT_SDK_PATH"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin"
    echo
    
    # Try to find SDK automatically
    if [ -d "$DEFAULT_SDK_PATH" ]; then
        print_warning "Found Android SDK at: $DEFAULT_SDK_PATH"
        print_info "You can set it temporarily with:"
        echo "export ANDROID_HOME=$DEFAULT_SDK_PATH"
        export ANDROID_HOME="$DEFAULT_SDK_PATH"
        export PATH="$PATH:$ANDROID_HOME/emulator"
        export PATH="$PATH:$ANDROID_HOME/platform-tools"
        export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
    else
        print_error "Android SDK not found. Please install Android Studio."
        exit 1
    fi
else
    print_success "ANDROID_HOME is set: $ANDROID_HOME"
fi

# Verify Android SDK exists
if [ ! -d "$ANDROID_HOME" ]; then
    print_error "Android SDK not found at: $ANDROID_HOME"
    print_info "Please install Android Studio or Android SDK Tools"
    exit 1
fi

# Check required tools
echo
print_info "Checking Android development tools..."

# Check ADB
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb version | head -n1)
    print_success "ADB: $ADB_VERSION"
else
    print_error "ADB not found in PATH"
fi

# Check Emulator
if command -v emulator &> /dev/null; then
    print_success "Emulator: Available"
else
    print_warning "Emulator not found in PATH"
fi

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n1)
    print_success "Java: $JAVA_VERSION"
else
    print_error "Java not found. Please install JDK 17"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
fi

# Check npm/yarn
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm: $NPM_VERSION"
fi

if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    print_success "Yarn: $YARN_VERSION"
fi

echo
print_success "Environment setup complete!"
print_info "You can now run:"
echo "  npm install"
echo "  npm run android"
echo
print_info "For production builds:"
echo "  ./scripts/build-release.sh"
