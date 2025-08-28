---
name: Performance Issue 🐌
about: Report a performance problem in DealersCloud
title: '[PERFORMANCE] '
labels: 'performance, needs triage'
assignees: ''
---

## 🐌 Performance Issue

**Describe the performance problem**
A clear and concise description of what performance issue you're experiencing.

**Area affected:**
- [ ] App startup time
- [ ] Screen loading time
- [ ] API response time
- [ ] Database queries
- [ ] File upload/download
- [ ] Real-time messaging
- [ ] UI responsiveness
- [ ] Memory usage
- [ ] Battery drain
- [ ] Other: ___________

## 📊 Performance Metrics

**Current performance:**
- Response time: ___ seconds
- Memory usage: ___ MB
- CPU usage: ___% 
- Network requests: ___ per action

**Expected performance:**
- Response time: ___ seconds
- Memory usage: ___ MB
- CPU usage: ___%
- Network requests: ___ per action

**When does this occur:**
- [ ] All the time
- [ ] During peak usage
- [ ] With large datasets
- [ ] On specific devices
- [ ] In specific network conditions

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Wait for '....'
4. Observe slow performance

**Frequency:**
- [ ] Always slow
- [ ] Sometimes slow
- [ ] Progressively gets slower
- [ ] Slow only in specific conditions

## 📱 Environment

**Mobile Device:**
- Device: [e.g. iPhone 14, Samsung Galaxy S23]
- OS Version: [e.g. iOS 17.2, Android 13]
- RAM: [e.g. 8GB]
- Storage Available: [e.g. 50GB free]
- App Version: [e.g. 1.0.0]

**Network:**
- Connection Type: [e.g. WiFi, 4G, 5G]
- Speed: [e.g. 100 Mbps down, 20 Mbps up]
- Latency: [e.g. 50ms]

**Backend Environment:**
- Server specs: [if known]
- Database size: [approximate]
- Concurrent users: [approximate]

## 📈 Performance Data

**Timeline of issue:**
- When did you first notice this? [date/time]
- Has it gotten worse over time? [yes/no]
- Any recent changes that might have caused it? [describe]

**Data size:**
- Number of records affected: ___
- File sizes involved: ___
- Dataset size: ___

## 🔍 Investigation

**What I've tried:**
- [ ] Restarted the app
- [ ] Cleared app cache
- [ ] Tested on different network
- [ ] Tested on different device
- [ ] Updated to latest version
- [ ] Reduced data load

**Profiling data (if available):**
<!-- Include any performance profiling data, screenshots of developer tools, etc. -->

## 📸 Evidence

**Screenshots:**
<!-- Add screenshots of slow loading screens, performance monitors, etc. -->

**Screen recordings:**
<!-- If possible, include screen recordings showing the slow performance -->

**Logs:**
```
Paste relevant performance logs here
```

## 🎯 Impact Assessment

**User impact:**
- Number of users affected: [estimate]
- Business operations affected: [describe]
- Revenue impact: [if applicable]

**Severity:**
- [ ] Critical (app unusable)
- [ ] High (significantly impacts user experience)
- [ ] Medium (noticeable but manageable)
- [ ] Low (minor performance degradation)

## 💡 Potential Solutions

**Ideas for improvement:**
<!-- Any ideas you have for fixing or improving the performance -->

**Similar issues found:**
<!-- References to similar performance issues or solutions -->

## 📋 Checklist

- [ ] I have searched for existing performance issues
- [ ] I have provided specific performance metrics
- [ ] I have tested on multiple devices/networks (if possible)
- [ ] I have provided environment details
- [ ] I have tried basic troubleshooting steps

---

**For Developers:**
- Expected investigation areas: `frontend`, `backend`, `database`, `network`, `infrastructure`
- Profiling tools needed: `react-devtools`, `flipper`, `sql-profiler`, `application-insights`
