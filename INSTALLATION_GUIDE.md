# DealersCloud Installation Guide

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React Native](https://img.shields.io/badge/react--native-0.75.2-blue)

This comprehensive guide will walk you through setting up the DealersCloud Full-Stack application on your development machine.

## 📋 Prerequisites

### System Requirements

#### For Backend Development
- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0 or **Yarn**: >= 1.22.0
- **SQL Server**: 2019+ or Azure SQL Database
- **Redis**: >= 6.0 (for caching)
- **Git**: Latest version

#### For Mobile Development
- **React Native CLI**: Latest
- **Android Studio**: 2023.1+ (for Android development)
- **Xcode**: 14+ (for iOS development, macOS only)
- **Java Development Kit (JDK)**: 17 (for Android)
- **CocoaPods**: Latest (for iOS dependencies)

#### Cloud Services (Production)
- **Azure Account** (for Azure Blob Storage, SQL Database, Redis Cache)
- **SendGrid Account** (for email services)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ammanabbasi/DCAP.git
cd DCAP
```

### 2. Install Dependencies

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# iOS specific (macOS only)
cd ios && pod install && cd ..
```

### 3. Set Up Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### 4. Set Up Database

```bash
# Create SQL Server database
# Run database migrations (if available)
cd backend
npm run migrate # if migration scripts exist
```

### 5. Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend Metro
cd frontend
npm start

# Terminal 3 - Start Mobile App
# For Android:
npm run android

# For iOS (macOS only):
npm run ios
```

## 🔧 Detailed Setup Instructions

### Backend Setup

#### 1. Node.js Installation

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Install the LTS version
3. Verify installation: `node --version` and `npm --version`

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. SQL Server Setup

**Option A: Local SQL Server (Windows)**
1. Download SQL Server Developer Edition
2. Install with default settings
3. Install SQL Server Management Studio (SSMS)
4. Create database: `dealerscloud_db`

**Option B: SQL Server on Docker (Linux/macOS)**
```bash
# Pull SQL Server image
docker pull mcr.microsoft.com/mssql/server:2022-latest

# Run SQL Server container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sqlserver -d \
   mcr.microsoft.com/mssql/server:2022-latest

# Connect and create database
sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
CREATE DATABASE dealerscloud_db;
GO
```

**Option C: Azure SQL Database (Production)**
1. Create Azure SQL Database
2. Configure firewall rules
3. Get connection string

#### 3. Redis Setup

**Local Redis:**
```bash
# Windows (using Chocolatey)
choco install redis-64

# macOS (using Homebrew)
brew install redis
brew services start redis

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**Docker Redis:**
```bash
docker run --name redis -p 6379:6379 -d redis:alpine
```

#### 4. Backend Environment Configuration

Create `backend/.env`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database Configuration (SQL Server)
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_SERVER=localhost
DB_DATABASE=dealerscloud_db
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-256-bits
JWT_EXPIRES_IN=24h

# Azure Storage (for file uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# SendGrid Email
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@dealerscloud.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

#### 5. Start Backend Server

```bash
cd backend

# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Test font configuration (if needed)
npm run test-fonts

# Set up fonts (if needed)
npm run setup-fonts
```

**Verify Backend Setup:**
- Visit `http://localhost:3000/api-docs` for Swagger documentation
- Check `http://localhost:3000/api/health` for health status
- Test login endpoint with API client

### Frontend Setup

#### 1. React Native Development Environment

**Install React Native CLI:**
```bash
npm install -g @react-native-community/cli
```

#### 2. Android Development Setup

**Install Android Studio:**
1. Download from [developer.android.com](https://developer.android.com/studio)
2. Install with default settings
3. Open Android Studio → More Actions → SDK Manager
4. Install Android SDK Platform 33 and 34
5. Install Android SDK Build-Tools
6. Install Android Emulator

**Configure Environment Variables:**

**Windows:**
```cmd
# Add to System Environment Variables
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Create Android Virtual Device (AVD):**
1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device
4. Choose device and system image (API 33 or 34)

#### 3. iOS Development Setup (macOS only)

**Install Xcode:**
1. Install from Mac App Store
2. Launch Xcode and accept license
3. Install additional components when prompted

**Install CocoaPods:**
```bash
sudo gem install cocoapods

# If you encounter permission issues
sudo gem install -n /usr/local/bin cocoapods
```

#### 4. Frontend Environment Configuration

Create `frontend/.env`:
```env
# API Configuration
API_BASE_URL=http://localhost:3000
SOCKET_URL=http://localhost:3000

# App Configuration
APP_NAME=DEALERVAiT
APP_VERSION=1.0.0
DEBUG_MODE=true

# Feature Flags
CHAT_ENABLED=true
REALTIME_ENABLED=true
BIOMETRIC_AUTH_ENABLED=true
DARK_MODE_ENABLED=true

# Development Settings
FLIPPER_ENABLED=true
DEV_MENU_ENABLED=true
```

For **Android** development, also create `frontend/android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

#### 5. Install Frontend Dependencies

```bash
cd frontend

# Install Node.js dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios
pod install
cd ..
```

#### 6. Start Frontend Application

**Start Metro bundler:**
```bash
cd frontend
npm start
```

**Run on Android:**
```bash
# Make sure Android emulator is running or device is connected
npm run android

# Or directly with React Native CLI
npx react-native run-android
```

**Run on iOS (macOS only):**
```bash
npm run ios

# Or directly with React Native CLI
npx react-native run-ios
```

## 🔍 Verification and Testing

### Backend Verification

1. **Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Database Connection:**
   ```bash
   # Check logs for successful database connection
   tail -f backend/logs/app.log
   ```

3. **API Documentation:**
   - Visit: `http://localhost:3000/api-docs`
   - Test login endpoint

### Frontend Verification

1. **Metro Bundler Status:**
   - Should show "Metro Bundler is running"
   - No compilation errors

2. **App Launch:**
   - App should launch without crashes
   - Login screen should be visible
   - Check for console errors

3. **API Connection:**
   - Test login functionality
   - Verify network requests in debugger

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -ti:3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Database Connection Failed:**
- Verify SQL Server is running
- Check connection string in `.env`
- Ensure database exists
- Check firewall settings

**Redis Connection Failed:**
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis status
redis-cli info server
```

#### Frontend Issues

**Metro Bundler Issues:**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear Watchman cache
watchman watch-del-all
```

**Android Build Issues:**
```bash
# Clean Android build
cd android
./gradlew clean

# Reset Android project
cd android
rm -rf build
rm -rf app/build
./gradlew clean
```

**iOS Build Issues:**
```bash
# Clean iOS build
cd ios
xcodebuild clean

# Reset CocoaPods
pod deintegrate
pod install
```

**Node Modules Issues:**
```bash
# Clean and reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# For iOS
cd ios
pod install
```

### Performance Optimization

**Backend:**
- Enable Redis caching
- Configure database connection pooling
- Use compression middleware
- Implement rate limiting

**Frontend:**
- Enable Hermes engine (Android)
- Use FlashList for large lists
- Implement image caching
- Minimize bundle size

## 🌐 Production Deployment

### Backend Deployment

**Azure App Service:**
1. Create Azure App Service
2. Configure environment variables
3. Set up continuous deployment
4. Configure Azure SQL Database
5. Set up Azure Redis Cache

**Docker Deployment:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Mobile App Deployment

**Android (Google Play Store):**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

**iOS (App Store):**
1. Open in Xcode
2. Product → Archive
3. Distribute to App Store
4. Follow App Store submission process

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Express.js Documentation](https://expressjs.com/)
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)
- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
- [Redis Documentation](https://redis.io/documentation)

## 🆘 Getting Help

If you encounter issues during installation:

1. Check the [Troubleshooting Section](#-troubleshooting)
2. Review the [FAQ](FAQ.md)
3. Search existing [GitHub Issues](https://github.com/ammanabbasi/DCAP/issues)
4. Create a new issue with:
   - Operating system and version
   - Node.js version
   - Complete error message
   - Steps to reproduce

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Supported Platforms**: Windows, macOS, Linux