import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { ArrowLeft, User, Phone, Mail, Lock, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import { styles } from './register.styles';
import CustomButton from '@/components/CustomButton';
import { useLoginMutation, useRegisterVendorOwnerMutation, useVerifyOtpMutation } from '@/services/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentialsAndPersist } from '@/features/auth/authSlice';
import { useGetUserVendorStatusQuery } from '@/services/applicationApi';
import { 
  validateRegisterFormStep1, 
  validateRegisterFormStep2,
  validateRegisterField, 
  cleanRegisterPhoneNumber,
  RegisterFormData
} from '../../validations/register_validation';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    otpCode: '',
  });
  const [picture, setPicture] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string>('');
  const [registerVendor, { isLoading: isRegistering }] = useRegisterVendorOwnerMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const { data: vendorStatusData, refetch: refetchVendorStatus } = useGetUserVendorStatusQuery(undefined, {
    skip: true // Skip initial fetch, we'll call it manually
  });

  const checkVendorStatusAndRoute = async () => {
    try {
      console.log('🔍 Checking vendor status...');
      const result = await refetchVendorStatus();
      
      if (result.data) {
        const { hasVendor, vendor } = result.data;
        
        if (!hasVendor) {
          console.log('🔍 No vendor found, redirecting to application');
          router.replace('/auth/application');
        } else if (vendor && !vendor.isApproved) {
          console.log('🔍 Vendor exists but not approved, redirecting to pending approval');
          router.replace('/auth/pending-approval');
        } else if (vendor && vendor.isApproved) {
          console.log('🔍 Vendor approved, redirecting to main app');
          router.replace('/(tabs)');
        } else {
          console.log('🔍 Unknown vendor status, redirecting to application');
          router.replace('/auth/application');
        }
      } else {
        console.log('🔍 Could not fetch vendor status, redirecting to application');
        router.replace('/auth/application');
      }
    } catch (error) {
      console.error('Error checking vendor status:', error);
      // If there's an error, redirect to application as fallback
      router.replace('/auth/application');
    }
  };

  // Validate individual field
  const validateField = (field: keyof RegisterFormData, value: string) => {
    const validation = validateRegisterField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.error || ''
    }));
    return validation.isValid;
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear register error when user starts typing
    if (registerError) {
      setRegisterError('');
    }
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof RegisterFormData) => {
    const value = formData[field];
    validateField(field, value);
  };

  const updateFormData = (key: string, value: string) => {
    handleFieldChange(key as keyof RegisterFormData, value);
  };

  // Parse and display register errors gracefully
  const parseRegisterError = (error: any): string => {
    console.log('🔍 Parsing register error:', error);
    
    // Network errors
    if (!error?.data && !error?.message) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // API response errors
    if (error?.data?.message) {
      const message = error.data.message.toLowerCase();
      
      // Backend validation errors
      if (message.includes('name is required')) {
        return 'Full name is required.';
      }
      
      if (message.includes('name must be at least 2 characters')) {
        return 'Full name must be at least 2 characters long.';
      }
      
      if (message.includes('name must be at most 50 characters')) {
        return 'Full name must not exceed 50 characters.';
      }
      
      if (message.includes('phone number must be a valid international format')) {
        return 'Please enter a valid phone number starting with 9.';
      }
      
      if (message.includes('phone number is required')) {
        return 'Phone number is required.';
      }
      
      if (message.includes('password is required')) {
        return 'Password is required.';
      }
      
      if (message.includes('password must be at least 6 characters')) {
        return 'Password must be at least 6 characters long.';
      }
      
      if (message.includes('password must be at most 64 characters')) {
        return 'Password must not exceed 64 characters.';
      }
      
      if (message.includes('email must be a valid email address')) {
        return 'Please enter a valid email address.';
      }
      
      if (message.includes('picture must be a valid url')) {
        return 'Please select a valid image file.';
      }
      
      // User already exists
      if (message.includes('user already exists') || message.includes('phone number already registered')) {
        return 'An account with this phone number already exists. Please try logging in instead.';
      }
      
      // OTP errors
      if (message.includes('invalid otp') || message.includes('otp expired')) {
        return 'Invalid or expired OTP code. Please try again.';
      }
      
      // Return the original message if it's user-friendly
      return error.data.message;
    }
    
    // HTTP status code errors
    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 409:
          return 'An account with this phone number already exists. Please try logging in instead.';
        case 500:
          return 'Server error. Please try again in a few moments.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return 'An error occurred. Please try again.';
      }
    }
    
    // Generic error messages
    if (error?.message) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      
      return error.message;
    }
    
    // Fallback error message
    return 'Registration failed. Please try again.';
  };

  const handleNext = () => {
    if (step === 1) {
      // Clear previous errors
      setRegisterError('');
      setFieldErrors({});
      
      // Validate step 1 form
      const validation = validateRegisterFormStep1(formData);
      
      if (!validation.isValid) {
        // Set field errors
        const errors: Record<string, string> = {};
        validation.errors.forEach(error => {
          errors[error.field] = error.error || '';
        });
        setFieldErrors(errors);
        return;
      }
      
      handleSubmit();
    } else if (step === 2) {
      // Clear previous errors
      setRegisterError('');
      setFieldErrors({});
      
      // Validate step 2 form
      const validation = validateRegisterFormStep2(formData);
      
      if (!validation.isValid) {
        // Set field errors
        const errors: Record<string, string> = {};
        validation.errors.forEach(error => {
          errors[error.field] = error.error || '';
        });
        setFieldErrors(errors);
        return;
      }
      
      handleVerifyOtp();
    }
  };

  const handleSubmit = async () => {
    try {
      await registerVendor({
        name: formData.fullName,
        phone_number: cleanRegisterPhoneNumber(formData.phoneNumber),
        password: formData.password,
        email: formData.email || undefined,
        picture: picture || undefined,
      }).unwrap();
      setStep(2);
    } catch (e: any) {
      const errorMessage = parseRegisterError(e);
      setRegisterError(errorMessage);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission required', 'We need media library permission to select a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.fileName || `profile_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      setPicture({ uri: asset.uri, name: fileName, type: mimeType });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp({ 
        phone_number: cleanRegisterPhoneNumber(formData.phoneNumber), 
        code: formData.otpCode 
      }).unwrap();
      
      const loggedIn = await login({ 
        phone_number: cleanRegisterPhoneNumber(formData.phoneNumber), 
        password: formData.password 
      }).unwrap();
      
      if (loggedIn.token) {
        await dispatch(setCredentialsAndPersist({ 
          user: loggedIn.user, 
          token: loggedIn.token 
        })).unwrap();
        
        // Check vendor status and route accordingly
        await checkVendorStatusAndRoute();
      } else {
        setRegisterError('Login failed after OTP verification.');
      }
    } catch (e: any) {
      const errorMessage = parseRegisterError(e);
      setRegisterError(errorMessage);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Create your account</Text>
      
      {/* Register Error Display */}
      {registerError && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.registerErrorText}>{registerError}</Text>
          <TouchableOpacity 
            onPress={() => setRegisterError('')}
            style={styles.errorDismissButton}
          >
            <Text style={styles.errorDismissText}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={[
          styles.inputContainer,
          fieldErrors.fullName && styles.inputContainerError
        ]}>
          <User size={20} color={fieldErrors.fullName ? COLORS.error : COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(value) => updateFormData('fullName', value)}
            onBlur={() => handleFieldBlur('fullName')}
            autoCapitalize="words"
            maxLength={50}
          />
        </View>
        {fieldErrors.fullName && (
          <Text style={styles.errorText}>{fieldErrors.fullName}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={[
          styles.inputContainer,
          fieldErrors.phoneNumber && styles.inputContainerError
        ]}>
          <Text style={styles.phonePrefix}>+251</Text>
          <Phone size={20} color={fieldErrors.phoneNumber ? COLORS.error : COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData('phoneNumber', value)}
            onBlur={() => handleFieldBlur('phoneNumber')}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>
        {fieldErrors.phoneNumber && (
          <Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email (optional)</Text>
        <View style={[
          styles.inputContainer,
          fieldErrors.email && styles.inputContainerError
        ]}>
          <Mail size={20} color={fieldErrors.email ? COLORS.error : COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            onBlur={() => handleFieldBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
        </View>
        {fieldErrors.email && (
          <Text style={styles.errorText}>{fieldErrors.email}</Text>
        )}
      </View>

      {/* Only phone number, name and password required */}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <View style={[
          styles.inputContainer,
          fieldErrors.password && styles.inputContainerError
        ]}>
          <Lock size={20} color={fieldErrors.password ? COLORS.error : COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter a strong password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            onBlur={() => handleFieldBlur('password')}
            secureTextEntry
            autoCapitalize="none"
            maxLength={64}
          />
        </View>
        {fieldErrors.password && (
          <Text style={styles.errorText}>{fieldErrors.password}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Profile Picture (optional)</Text>
        <View style={styles.inputContainer}>
          <CustomButton title={picture ? 'Change Picture' : 'Upload Picture'} onPress={pickImage} />
        </View>
        {picture && (
          <View style={{ marginTop: SIZES.sm }}>
            <Image source={{ uri: picture.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
          </View>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verify Phone</Text>
      <Text style={styles.stepSubtitle}>Enter the OTP sent to +251{formData.phoneNumber}</Text>

      {/* Register Error Display */}
      {registerError && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.registerErrorText}>{registerError}</Text>
          <TouchableOpacity 
            onPress={() => setRegisterError('')}
            style={styles.errorDismissButton}
          >
            <Text style={styles.errorDismissText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>OTP Code *</Text>
        <View style={[
          styles.inputContainer,
          fieldErrors.otpCode && styles.inputContainerError
        ]}>
          <TextInput
            style={styles.textInput}
            placeholder="6-digit code"
            value={formData.otpCode}
            onChangeText={(value) => updateFormData('otpCode', value)}
            onBlur={() => handleFieldBlur('otpCode')}
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
          />
        </View>
        {fieldErrors.otpCode && (
          <Text style={styles.errorText}>{fieldErrors.otpCode}</Text>
        )}
      </View>
    </View>
  );

  // removed legacy step 3 (business/individual and payment) per backend requirements

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 2</Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <CustomButton
          title={step === 1 ? 'Register' : 'Verify & Login'}
          onPress={handleNext}
          loading={isRegistering || isVerifying || isLoggingIn}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}
