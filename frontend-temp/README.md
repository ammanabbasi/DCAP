# DealerVait - Vehicle Dealer Management App

[![React Native](https://img.shields.io/badge/React_Native-0.75.2-blue.svg)](https://reactnative.dev/)
[![Android](https://img.shields.io/badge/Android-API%2023+-green.svg)](https://developer.android.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)

DealerVait is a comprehensive mobile application designed for automotive dealerships to manage vehicle inventory, customer relationships, and business operations efficiently.

## 🚀 Features

- **Vehicle Inventory Management** - Add, edit, and track vehicle details
- **Customer Relationship Management (CRM)** - Manage customer interactions and data
- **Document Management** - Upload and organize vehicle documents
- **Real-time Communication** - Chat and messaging capabilities
- **Photo Management** - Capture and manage vehicle images
- **Financial Tracking** - Handle payments and financial transactions
- **User Authentication** - Secure login and role-based access
- **Offline Support** - Work offline with data synchronization

## 🏗️ Architecture

- **Frontend**: React Native 0.75.2 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 7.x
- **API Communication**: Axios with interceptors
- **Real-time**: Socket.IO for live updates
- **Storage**: MMKV for fast local storage
- **UI Components**: React Native Paper + Custom components

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ 
- **React Native CLI** or **Expo CLI**
- **Android Studio** with Android SDK
- **JDK 17** (recommended for RN 0.75+)
- **Git**

### Android Development Environment
```bash
# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone [your-repo-url]
cd dcapp2/frontend-temp
npm install
```

### 2. Configure Environment
```bash
# Copy example configuration
cp android/gradle.properties.example android/gradle.properties

# Edit with your keystore details (for production builds)
```

### 3. Start Development
```bash
# Start Metro bundler
npm start

# Run on Android (new terminal)
npm run android

# Run on iOS (if configured)
npm run ios
```

### 4. Development Testing
The app connects to live APIs:
- **Primary API**: `https://dcrnapi.azurewebsites.net/api/`
- **Secondary API**: `https://dcgptrnapi.azurewebsites.net/api/`
- **Test Account**: username: `aitest`, password: `1234`

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Metro bundler
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator (if configured)  
npm run lint       # Run ESLint
npm test          # Run Jest tests
npm run test:watch # Run tests in watch mode
```

### Project Structure
```
src/
├── Components/     # Reusable UI components
├── Screens/        # Screen components
├── Services/       # API services and configuration
├── navigation/     # Navigation configuration
├── redux/          # Redux store and slices
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
├── config/         # App configuration
└── tests/          # Test files and setup
```

### Development Guidelines

1. **Code Style**: Follow ESLint configuration
2. **Components**: Use TypeScript interfaces for props
3. **State Management**: Use Redux Toolkit for complex state
4. **API Calls**: Use the configured axios clients in `src/Services/`
5. **Testing**: Write unit tests for utilities and components
6. **Accessibility**: Include accessibility props for UI elements

## 🚀 Production Build

### Automated Build (Recommended)
```bash
# Make script executable (first time)
chmod +x scripts/build-release.sh

# Build production APK and AAB
./scripts/build-release.sh
```

### Build Outputs
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

For detailed build instructions, see [BUILD.md](./BUILD.md).

## 🧪 Testing

### Automated Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginScreen.test.tsx
```

### Production Testing
```bash
# Test production build on device
chmod +x scripts/test-production.sh
./scripts/test-production.sh
```

### Testing Checklist
- [ ] Login/logout functionality
- [ ] Vehicle inventory operations
- [ ] Document upload/download
- [ ] Camera functionality
- [ ] Offline/online sync
- [ ] Performance on different devices

## 🔐 Security

### Security Features
- **HTTPS Only**: Network security config enforces HTTPS
- **Code Obfuscation**: ProGuard/R8 enabled for release builds
- **Console.log Removal**: Debug logs removed in production
- **Secure Storage**: Sensitive data encrypted
- **Permission Management**: Runtime permissions properly handled

### Security Checklist
- [ ] No hardcoded secrets in source code
- [ ] Production keystore configured
- [ ] Debug features disabled in release
- [ ] Network traffic encrypted
- [ ] User data properly validated

## ♿ Accessibility

The app includes accessibility features:
- Screen reader support
- Content descriptions for images
- Proper focus management
- High contrast support
- Touch target sizing (48dp minimum)

Test accessibility using TalkBack on Android.

## 📱 Supported Platforms

### Android
- **Minimum SDK**: API 23 (Android 6.0)
- **Target SDK**: API 34 (Android 14)
- **Architectures**: arm64-v8a, armeabi-v7a, x86, x86_64

### Device Testing
Tested on:
- Physical Android devices (API 26-34)
- Various screen sizes and densities
- Different Android manufacturers

## 🚀 Deployment

### Google Play Store
1. Build AAB using build script
2. Upload to Play Console
3. Complete store listing
4. Submit for review

See [PLAY_STORE_REQUIREMENTS.md](./PLAY_STORE_REQUIREMENTS.md) for detailed requirements.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup
```bash
# Install dependencies
npm install

# Install git hooks
npm run prepare

# Run linting
npm run lint

# Run tests
npm test
```

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support or questions:
- **Email**: [support-email]
- **Documentation**: See docs/ folder
- **Issues**: Create an issue in the repository

## 🔄 API Documentation

The app integrates with DealersCloud API:
- **Base URL**: `https://dcrnapi.azurewebsites.net/api/`
- **Authentication**: Bearer token
- **Documentation**: See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

## 📊 Performance

### Optimization Features
- **Bundle splitting**: Enabled for smaller APK sizes
- **Image optimization**: Automatic image compression
- **Lazy loading**: Components loaded on demand
- **Memory management**: Proper cleanup and monitoring
- **Network optimization**: Request caching and retries

### Performance Monitoring
- Use Flipper for debugging (development only)
- Monitor with built-in performance tools
- Track startup time and memory usage

---

**Note**: This is a production-ready application with comprehensive security, performance, and accessibility features implemented.