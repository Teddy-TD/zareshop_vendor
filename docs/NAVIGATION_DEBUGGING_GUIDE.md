# Navigation Debugging Guide

## 🔍 **Debugging the "Proceed to Next Step" Issue**

I've added extensive debugging to help identify why the navigation isn't working properly. Here's what to look for:

## 📊 **Debug Logs to Check**

### **1. When Button is Pressed**
Look for these console logs when you press the "Proceed to Next Step" button:

```
🚀 Starting proceed to next step...
📋 Proceed API response: {full JSON response}
📊 Payment status: {pending|completed|failed}
🎯 Next step: {vendor_setup|vendor_management|wait_approval|upload_proof}
✅ Can proceed: {true|false}
🎬 Available actions: [{action objects}]
```

### **2. Navigation Decision**
Based on `can_proceed`:
- **If `true`**: `🎯 Can proceed - handling direct navigation`
- **If `false`**: `⚠️ Cannot proceed directly - showing action selection`

### **3. Action Execution**
```
🎯 Primary action found: {action object}
🎬 Executing action: {create_vendor|manage_vendor|wait_approval|etc}
```

### **4. Navigation Attempt**
```
🧭 Attempting to navigate to: {path}
📍 Navigating to {specific screen} screen
✅ Navigation command sent for {path}
```

## 🧪 **Testing Features Added**

### **Debug Buttons (Development Only)**
I've added test buttons that only appear in development mode:
- **🧪 Test Navigation to Application** - Tests direct navigation to `/auth/application`
- **🧪 Test Navigation to Vendor Registration** - Tests direct navigation to `/auth/vendor-registration`

### **Enhanced Logging**
- All API responses are logged in full
- Navigation attempts are tracked step-by-step
- Error cases are clearly identified

## 🔧 **Common Issues to Check**

### **1. API Response Issues**
- **Check if API call succeeds**: Look for `📋 Proceed API response`
- **Check payment status**: Should be `pending`, `completed`, `failed`, etc.
- **Check available actions**: Should contain action objects with `url` properties

### **2. Navigation Issues**
- **Router not working**: Test with debug buttons first
- **Path issues**: Check if the paths match existing routes
- **Type errors**: Look for TypeScript navigation errors

### **3. Payment State Issues**
- **Payment not found**: Check if `paymentId` is valid
- **User permissions**: Check if user owns the payment
- **Payment status**: Verify payment is in expected state

## 🎯 **Expected Flow for Different Scenarios**

### **Scenario 1: Completed Payment (No Vendor)**
```
Payment Status: completed
Can Proceed: true
Primary Action: create_vendor
URL: /auth/application
Expected: Alert → User confirms → Navigate to application
```

### **Scenario 2: Completed Payment (Has Vendor)**
```
Payment Status: completed
Can Proceed: true
Primary Action: manage_vendor
URL: /(tabs)
Expected: Alert → User confirms → Navigate to dashboard
```

### **Scenario 3: Pending with Proof**
```
Payment Status: pending
Can Proceed: false
Actions: [wait_approval, force_proceed]
Expected: Show choice dialog with options
```

### **Scenario 4: Pending without Proof**
```
Payment Status: pending
Can Proceed: false
Primary Action: upload_proof
Expected: Show upload guidance message
```

## 🚨 **Troubleshooting Steps**

### **Step 1: Check Console Logs**
1. Open developer console
2. Press "Proceed to Next Step" button
3. Look for the debug logs listed above
4. Identify where the flow breaks

### **Step 2: Test Direct Navigation**
1. Use the debug test buttons (🧪)
2. See if basic navigation works
3. If test buttons don't work, it's a router issue

### **Step 3: Check API Response**
1. Look at the `📋 Proceed API response` log
2. Verify the structure matches expected format
3. Check if `actions` array contains proper URLs

### **Step 4: Verify Route Exists**
1. Check if the target route exists in the app structure
2. Verify the path matches exactly (case-sensitive)
3. Ensure no typos in route names

## 🛠 **Quick Fixes**

### **If Navigation Commands Are Sent But Nothing Happens**
```typescript
// Try this alternative approach
import { useRouter } from 'expo-router';
// Instead of router.push, try:
router.replace('/auth/application');
// Or force refresh:
router.push('/auth/application');
setTimeout(() => router.replace('/auth/application'), 100);
```

### **If API Response is Empty/Wrong**
- Check backend `proceedToNextStep` function
- Verify payment exists and belongs to user
- Check database connection

### **If Actions Don't Have URLs**
- Check `getAvailableActions` function in backend
- Verify action objects include `url` property
- Ensure URLs match frontend routes

## 📱 **Testing Checklist**

- [ ] Press "Proceed to Next Step" button
- [ ] Check console for debug logs
- [ ] Verify API response structure
- [ ] Test debug navigation buttons
- [ ] Try different payment statuses
- [ ] Test with/without payment proof
- [ ] Test with/without existing vendor

## 🎯 **Expected Results**

After pressing "Proceed to Next Step":
1. **Console shows all debug logs**
2. **API call succeeds with proper response**
3. **Navigation logic executes correctly**
4. **User sees appropriate alert/dialog**
5. **Navigation occurs when user confirms**

If any step fails, the logs will show exactly where the issue occurs! 🔍
