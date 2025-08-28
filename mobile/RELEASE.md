# DealerVait Release Guide

This document outlines the complete release process for deploying DealerVait to production and the Google Play Store.

## 📋 Pre-Release Checklist

### Code Quality
- [ ] All linting issues resolved (`npm run lint`)
- [ ] All tests passing (`npm test`)
- [ ] Code review completed
- [ ] Performance testing completed
- [ ] Security audit completed

### Version Management
- [ ] Version bumped in `package.json`
- [ ] Version code incremented for Android
- [ ] CHANGELOG.md updated with release notes
- [ ] Git tagged with version number

### Configuration
- [ ] Production API endpoints configured
- [ ] Production keystore configured
- [ ] Debug flags disabled
- [ ] Console logs removed/disabled
- [ ] Environment variables set

## 🔨 Build Process

### 1. Version Increment

```bash
# Set version for this release
export VERSION_CODE=2
export VERSION_NAME="1.0.1"

# Update package.json version
npm version patch  # or minor/major
```

### 2. Production Build

```bash
# Clean previous builds
./scripts/clean-build.sh  # if available
cd android && ./gradlew clean && cd ..

# Build production artifacts
./scripts/build-release.sh
```

### 3. Verify Build Artifacts

```bash
# Check APK exists and is signed
ls -la android/app/build/outputs/apk/release/
apksigner verify android/app/build/outputs/apk/release/app-release.apk

# Check AAB exists
ls -la android/app/build/outputs/bundle/release/
```

## 🧪 Testing Phase

### 1. Device Testing

```bash
# Install and test on physical device
./scripts/test-production.sh
```

### 2. Manual Testing Checklist

#### Core Functionality
- [ ] App launches successfully
- [ ] Login/logout works
- [ ] API connectivity verified
- [ ] All major screens load
- [ ] Navigation works properly
- [ ] Data persistence works
- [ ] File upload/download works
- [ ] Camera functionality works

#### Performance Testing
- [ ] App startup time < 3 seconds
- [ ] Smooth scrolling and animations
- [ ] Memory usage within acceptable limits
- [ ] No memory leaks detected
- [ ] Battery usage reasonable

#### Security Testing
- [ ] HTTPS only (check network logs)
- [ ] No sensitive data in logs
- [ ] Proper permission handling
- [ ] Secure data storage
- [ ] Authentication working properly

#### Accessibility Testing
- [ ] TalkBack navigation works
- [ ] Content descriptions present
- [ ] Touch targets adequate size
- [ ] Color contrast adequate
- [ ] Text scaling works

### 3. Different Device Testing

Test on variety of devices:
- [ ] Phone with Android 6.0 (API 23)
- [ ] Phone with Android 14 (API 34)
- [ ] Tablet device
- [ ] Different screen densities
- [ ] Different manufacturers (Samsung, Google, etc.)

## 🚀 Google Play Store Release

### 1. Prepare Store Assets

#### Required Graphics
- [ ] App icon (512x512 PNG, no transparency)
- [ ] Feature graphic (1024x500 JPG/PNG)
- [ ] Screenshots (minimum 2, maximum 8)
  - [ ] Phone screenshots (16:9 or 9:16 aspect ratio)
  - [ ] 7-inch tablet screenshots (optional)
  - [ ] 10-inch tablet screenshots (optional)

#### Store Listing Content
```
Title: DealerVait - Vehicle Inventory Management
Short Description: Professional vehicle dealer management and CRM solution
Full Description: [See PLAY_STORE_REQUIREMENTS.md]
Keywords: dealer, inventory, vehicle, automotive, CRM, business
```

### 2. Upload to Play Console

1. **Go to Play Console**: [https://play.google.com/console](https://play.google.com/console)

2. **Upload Bundle**:
   - Select your app
   - Go to "Production" track
   - Click "Create new release"
   - Upload AAB file: `android/app/build/outputs/bundle/release/app-release.aab`

3. **Release Notes**:
```
Version 1.0.1
- Initial production release
- Vehicle inventory management
- Customer relationship management
- Document management capabilities
- Real-time communication features
- Performance optimizations
- Security enhancements
```

### 3. Configure Release

#### Release Settings
- [ ] **Release Type**: Production
- [ ] **Staged Rollout**: Start with 5% → 20% → 50% → 100%
- [ ] **Release Notes**: Added in multiple languages if supported

#### Store Listing
- [ ] **Content Rating**: Complete questionnaire
- [ ] **Target Audience**: Business/Professional
- [ ] **Pricing**: Free (assuming business app)
- [ ] **Distribution**: Select target countries

#### App Content
- [ ] **Privacy Policy**: Link to hosted privacy policy
- [ ] **Data Safety**: Complete data collection disclosure
- [ ] **App Access**: Full functionality available to all users
- [ ] **Content Guidelines**: Verified compliance

### 4. Review and Submit

1. **Review Summary Page**:
   - Check all information is correct
   - Verify screenshots and descriptions
   - Confirm technical details

2. **Submit for Review**:
   - Click "Start rollout to Production"
   - Confirm submission

## 📊 Post-Release Monitoring

### 1. Immediate Monitoring (First 24 hours)

- [ ] Monitor crash reports in Play Console
- [ ] Check user reviews and ratings
- [ ] Verify app installs successfully
- [ ] Monitor server logs for API usage
- [ ] Check app performance metrics

### 2. Week 1 Monitoring

- [ ] Analytics review (user engagement, retention)
- [ ] Performance metrics (startup time, crashes)
- [ ] User feedback analysis
- [ ] Server performance under load
- [ ] Support ticket volume

### 3. Ongoing Monitoring

- [ ] Weekly crash report review
- [ ] Monthly performance analysis
- [ ] User review sentiment analysis
- [ ] Feature usage analytics
- [ ] Server cost and performance optimization

## 🔄 Hotfix Process

If critical issues are discovered:

### 1. Immediate Response
```bash
# Create hotfix branch
git checkout -b hotfix/critical-fix-v1.0.2

# Make minimal necessary changes
# Test thoroughly
# Increment patch version

# Build hotfix
export VERSION_CODE=3
export VERSION_NAME="1.0.2"
./scripts/build-release.sh
```

### 2. Emergency Release
- Upload new AAB to Play Console
- Mark as "Emergency release" if available
- Include detailed release notes explaining the fix
- Monitor closely after release

## 📈 Version Planning

### Semantic Versioning
- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes, security updates

### Release Schedule
- **Major releases**: Quarterly
- **Minor releases**: Monthly
- **Patch releases**: As needed
- **Hotfixes**: Emergency only

## 🚨 Rollback Process

If issues arise after release:

### 1. Play Console Rollback
- Go to Play Console
- Navigate to "Releases" → "Production"
- Click "Create new release"
- Select previous working APK/AAB
- Add rollback notes
- Submit for immediate release

### 2. Emergency Communications
- Notify stakeholders immediately
- Prepare user communication
- Monitor for resolution
- Post-mortem analysis

## 📝 Release Notes Template

```markdown
# Version X.Y.Z - Release Date

## 🆕 New Features
- Feature 1 description
- Feature 2 description

## 🐛 Bug Fixes
- Fixed issue with login
- Resolved camera performance issue

## 🔧 Improvements
- Improved app startup time
- Enhanced security measures

## 🔐 Security Updates
- Updated encryption protocols
- Enhanced data protection

## 📱 Compatibility
- Supports Android 6.0+ (API 23+)
- Optimized for Android 14

## ⚠️ Known Issues
- Issue 1 (workaround available)
- Issue 2 (fix in next release)
```

## 🎯 Success Metrics

Track these KPIs after each release:
- **Crash-free rate**: > 99.5%
- **ANR rate**: < 0.1%
- **App startup time**: < 3 seconds
- **User rating**: > 4.5 stars
- **Download conversion**: Target specific to app category
- **User retention**: Day 1, Day 7, Day 30

---

**Remember**: Each release represents your app to thousands of users. Take time to ensure quality and thoroughly test before releasing to production.
