# DealerVait Manual Testing Checklist

## 🚀 **PRE-TESTING SETUP**

### ✅ Environment Check
- [ ] Android emulator running OR physical device connected
- [ ] Metro bundler started (`npm start` or `start-testing.bat`)
- [ ] No critical red errors in Metro bundler console
- [ ] App installs and launches without crashes

---

## 📱 **CORE FUNCTIONALITY TESTING**

### 1. **🔐 Authentication Flow**
- [ ] **Splash Screen** displays correctly
- [ ] **Login Screen** loads without errors
- [ ] **Login with valid credentials** works
  - Test Account: `aitest` / `1234` (yahauto.autodealerscloud.com)
- [ ] **Login with invalid credentials** shows proper error
- [ ] **Remember me** functionality
- [ ] **Logout** works correctly

### 2. **📋 Main Navigation**  
- [ ] **Bottom Tab Navigation** displays correctly
- [ ] **Dashboard** loads without crashes
- [ ] **Inventory** tab navigates successfully  
- [ ] **CRM** tab loads properly
- [ ] **Messages** tab accessible
- [ ] **Profile** tab functions

### 3. **🚗 Vehicle Management**
- [ ] **Vehicle list** displays in Inventory
- [ ] **Add new vehicle** navigation works
- [ ] **Vehicle details** screen loads
- [ ] **Vehicle images** can be viewed
- [ ] **Vehicle documents** accessible
- [ ] **Vehicle basics** editing works

### 4. **👥 CRM Features**
- [ ] **Customer list** loads in CRM
- [ ] **Add new customer** functionality
- [ ] **Customer profile** details load
- [ ] **Lead management** accessible
- [ ] **Task creation** works
- [ ] **Appointment scheduling** loads

### 5. **💬 Communication**
- [ ] **Messages list** displays
- [ ] **Chat functionality** works
- [ ] **Send message** successful
- [ ] **Real-time updates** functioning
- [ ] **Message history** loads

### 6. **💰 Financial Features**
- [ ] **Purchase screen** loads
- [ ] **Payment methods** accessible
- [ ] **Transaction log** displays
- [ ] **Expense tracking** works
- [ ] **Financial calculations** accurate

---

## ⚠️ **KNOWN ISSUES TO MONITOR**

### **Expected Issues (527 remaining TypeScript errors):**

#### 📅 **Date Picker Issues**
- **Screens affected**: Purchase, Task
- **Symptom**: DatePicker component not found
- **Workaround**: Skip date selection for now

#### 📸 **Image Upload Issues**
- **Screens affected**: Profile, UploadImages
- **Symptom**: Image picker type errors
- **Workaround**: Try image upload, expect potential crashes

#### 🧭 **Navigation Edge Cases**
- **Screens affected**: Various payment screens
- **Symptom**: Some navigation.navigate() calls might fail
- **Workaround**: Use back button if navigation fails

#### 💾 **State Management**
- **Screens affected**: Purchase, Marketing, Options
- **Symptom**: Some data might not save properly
- **Workaround**: Re-enter data if it doesn't persist

---

## 🐛 **ERROR LOGGING**

### **Record These Issues:**
- [ ] **JavaScript errors** in Metro console
- [ ] **App crashes** with stack traces
- [ ] **Navigation failures** - which screens/buttons
- [ ] **API failures** - network request issues
- [ ] **UI rendering problems** - layout issues
- [ ] **Performance issues** - slow screens

### **Testing Log Format:**
```
ISSUE: [Brief Description]
SCREEN: [Screen Name]
STEPS: [How to reproduce]
ERROR: [Error message if any]
PRIORITY: [High/Medium/Low]
```

---

## 📊 **SUCCESS CRITERIA**

### **✅ Minimum Viable Testing (MVP)**
- [ ] App launches without crashing
- [ ] Login/logout flow works
- [ ] Can navigate between main screens
- [ ] Can view inventory/customer lists
- [ ] Basic CRUD operations function

### **🎯 Full Functionality Testing**
- [ ] All navigation paths work
- [ ] All forms submit successfully
- [ ] Real-time features function
- [ ] File uploads work
- [ ] API integration stable
- [ ] No critical user-blocking issues

---

## 🔧 **TROUBLESHOOTING**

### **If App Won't Start:**
1. Clean Metro cache: `npx metro-cache-clean`
2. Reset React Native: `npx react-native start --reset-cache`
3. Rebuild app: `npx react-native run-android --reset-cache`
4. Check Android emulator is running

### **If App Crashes:**
1. Check Metro bundler console for JavaScript errors
2. Check Android logcat: `npx react-native log-android`
3. Try navigating to different screen
4. Restart app if necessary

### **If Features Don't Work:**
1. Check network connectivity
2. Verify API endpoints are accessible
3. Check authentication token validity
4. Try logout/login to refresh session

---

## 📈 **TESTING COMPLETION**

### **Quick Test (30 minutes)**
- [ ] App launches and login works
- [ ] Main navigation functional
- [ ] Can view lists (inventory, customers)
- [ ] No immediate crashes

### **Comprehensive Test (2 hours)**
- [ ] All screens accessible
- [ ] All forms functional  
- [ ] All API calls successful
- [ ] Real-time features working
- [ ] File operations working

### **Production Readiness (4+ hours)**
- [ ] All user workflows tested
- [ ] All edge cases covered
- [ ] Performance tested
- [ ] Security features verified
- [ ] Cross-device compatibility

---

**Testing Status**: ⏳ Ready to begin  
**Confidence Level**: 85% - High confidence for basic functionality  
**Recommendation**: Start with Quick Test, then proceed based on results
