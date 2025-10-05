# Upload Button Troubleshooting Guide

## 🔍 Debugging Steps

I've added comprehensive debugging to help identify why the upload button isn't working. Here's what to check:

### Step 1: Check Console Logs

Open your development console and look for these debug messages:

1. **Payment Data Loading**:
   ```
   💳 Payment loading...
   💳 Payment data loaded: { id: X, status: "pending", payment_method: "manual", ... }
   ```

2. **Button Visibility Check**:
   ```
   🔍 Payment Debug Info: { 
     status: "pending", 
     payment_method: "manual", 
     manual_payment_proof: null,
     shouldShowButton: true 
   }
   ```

3. **Button Press Events**:
   ```
   🧪 Test button pressed!  (if test button works)
   🎯 Upload button pressed!  (if upload button works)
   ```

### Step 2: Verify Payment Conditions

The upload button only shows when ALL these conditions are met:

- ✅ `payment.status === 'pending'`
- ✅ `payment.payment_method === 'manual'`
- ✅ `payment.manual_payment_proof === null` (no proof uploaded yet)

### Step 3: Test Button Functionality

I've added a **yellow test button** that should always appear. Try clicking it:

- If test button works → Issue is with payment conditions
- If test button doesn't work → Issue is with button component or navigation

### Step 4: Check Common Issues

#### Issue 1: Payment Not Found
**Symptoms**: Console shows "💳 Payment loading error" or "💳 No payment data available"
**Solution**: 
- Verify the payment ID in the URL is correct
- Check if the payment exists in the database
- Ensure user has permission to view this payment

#### Issue 2: Wrong Payment Status
**Symptoms**: Console shows `shouldShowButton: false` with `status: "completed"` or other status
**Solution**: 
- Only pending payments show the upload button
- If payment is completed, the button won't appear (this is correct behavior)

#### Issue 3: Wrong Payment Method
**Symptoms**: Console shows `shouldShowButton: false` with `payment_method: "integrated"`
**Solution**: 
- Only manual payments need proof upload
- Integrated payments are processed automatically

#### Issue 4: Proof Already Uploaded
**Symptoms**: Console shows `shouldShowButton: false` with `manual_payment_proof: { ... }`
**Solution**: 
- If proof is already uploaded, button won't appear (this is correct behavior)
- User should see proof status instead

#### Issue 5: Button Not Responding
**Symptoms**: Button appears but doesn't respond to taps
**Solution**: 
- Check if `uploadingProof` state is stuck as `true`
- Check if button is disabled
- Verify `handleImagePicker` function is defined

### Step 5: Manual Testing Checklist

1. **Navigation**: 
   - [ ] Can you navigate to `/payment/[id]` screen?
   - [ ] Does the screen load without errors?

2. **Payment Data**:
   - [ ] Is payment data loading successfully?
   - [ ] Is payment status "pending"?
   - [ ] Is payment method "manual"?
   - [ ] Is manual_payment_proof null/empty?

3. **Button Visibility**:
   - [ ] Do you see the yellow test button?
   - [ ] Do you see the "Upload Payment Proof" button?
   - [ ] Does console show `shouldShowButton: true`?

4. **Button Functionality**:
   - [ ] Does test button show alert when pressed?
   - [ ] Does upload button show image picker alert?
   - [ ] Do camera/gallery options work?

### Step 6: Quick Fixes

#### Fix 1: Force Button to Show (Temporary)
Replace the button condition with:
```typescript
{true && (  // Force show button for testing
  <CustomButton ... />
)}
```

#### Fix 2: Check Payment ID
Verify you're using the correct payment ID:
```typescript
console.log('Payment ID from URL:', id);
console.log('Parsed Payment ID:', paymentId);
```

#### Fix 3: Reset Upload State
If button is stuck in loading state:
```typescript
// Add this button temporarily
<CustomButton
  title="Reset Upload State"
  onPress={() => {
    setUploadingProof(false);
    setUploadProgress(0);
  }}
/>
```

### Step 7: Create Test Payment

If you need a test payment with the right conditions:

1. **Backend**: Create a manual payment with status "pending"
2. **Database**: Ensure `manual_payment_proof` is null
3. **User**: Ensure current user owns the payment

### Step 8: API Testing

Test the upload endpoint directly:
```bash
# Test if endpoint exists
curl -X POST http://localhost:3000/api/mobile/vendor-registration/payment/1/upload-proof \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "proof_image=@test_image.jpg"
```

## 🚨 Most Common Issues

### 1. Payment Already Completed
**Problem**: User is trying to upload proof for a completed payment
**Solution**: This is expected behavior - completed payments don't need proof

### 2. Wrong Payment Method
**Problem**: User is trying to upload proof for integrated payment
**Solution**: This is expected behavior - only manual payments need proof

### 3. Proof Already Uploaded
**Problem**: User already uploaded proof and trying to upload again
**Solution**: Show current proof status instead of upload button

### 4. Permission Issues
**Problem**: User doesn't have camera/gallery permissions
**Solution**: Check permission handling in `pickImage` function

### 5. Network Issues
**Problem**: API calls failing due to network/server issues
**Solution**: Check server status and network connectivity

## 🔧 Debug Commands

Add these temporary buttons for debugging:

```typescript
// Debug payment data
<CustomButton
  title="Log Payment Data"
  onPress={() => console.log('Payment:', payment)}
/>

// Test image picker directly
<CustomButton
  title="Test Image Picker"
  onPress={() => pickImage('gallery')}
/>

// Test API endpoint
<CustomButton
  title="Test API"
  onPress={async () => {
    try {
      const result = await uploadPaymentProofFile({
        id: paymentId,
        data: new FormData()
      });
      console.log('API Test Result:', result);
    } catch (error) {
      console.error('API Test Error:', error);
    }
  }}
/>
```

## 📞 Next Steps

1. **Check Console**: Look for the debug messages above
2. **Test Conditions**: Verify payment meets all conditions
3. **Test Button**: Try the yellow test button first
4. **Report Findings**: Share what you see in the console logs

The debug information will help identify exactly where the issue is occurring!




