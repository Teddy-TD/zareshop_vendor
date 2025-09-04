import { useLoginMutation } from '@/services/authApi';
import {  useGetUserVendorStatusQuery } from '@/services/applicationApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentialsAndPersist } from '@/features/auth/authSlice';
import { extractUserFromToken } from '@/utils/jwtUtils';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Lock, Eye, EyeOff, ArrowLeft, Phone, Grid, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';
import { 
  validateLoginForm, 
  validateLoginField, 
  cleanPhoneNumber,
  LoginFormData
} from '../../validations/login_validation';


export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Track user ID after login
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const { data: vendorStatusData, isLoading: vendorStatusLoading, error: vendorStatusError } =
    useGetUserVendorStatusQuery(undefined, {
      skip: !userId, // Only run the query when userId is available
    });

  const checkVendorStatusAndRoute = async () => {
    if (vendorStatusLoading) {
      console.log('🔍 Vendor status is still loading...');
      return;
    }

    if (vendorStatusError) {
      console.error('Error checking vendor status:', vendorStatusError);
      Alert.alert('Error', 'Could not fetch vendor status. Redirecting to application.');
      router.replace('/auth/application');
      return;
    }

    if (vendorStatusData) {
      const { hasVendor, vendor } = vendorStatusData;

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
      console.log('🔍 No vendor status data, redirecting to application');
      router.replace('/auth/application');
    }
  };

  // Validate individual field
  const validateField = (field: keyof LoginFormData, value: string) => {
    const validation = validateLoginField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.error || ''
    }));
    return validation.isValid;
  };

  // Handle field change with validation
  const handleFieldChange = (field: keyof LoginFormData, value: string) => {
    if (field === 'phoneNumber') {
      setPhoneNumber(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: keyof LoginFormData) => {
    const value = field === 'phoneNumber' ? phoneNumber : password;
    validateField(field, value);
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    Alert.alert(
      'Forgot Password',
      'Forgot password functionality will be implemented soon. Please contact support for assistance.',
      [{ text: 'OK' }]
    );
  };

  // Parse and display login errors gracefully
  const parseLoginError = (error: any): string => {
    console.log('🔍 Parsing login error:', error);
    
    // Network errors
    if (!error?.data && !error?.message) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // API response errors
    if (error?.data?.message) {
      const message = error.data.message.toLowerCase();
      
      // Backend validation errors
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
      
      // Authentication errors
      if (message.includes('invalid credentials') || message.includes('invalid phone') || message.includes('invalid password')) {
        return 'Invalid phone number or password. Please check your credentials and try again.';
      }
      
      if (message.includes('user not found')) {
        return 'No account found with this phone number. Please check your phone number or create a new account.';
      }
      
      if (message.includes('account locked') || message.includes('account suspended')) {
        return 'Your account has been temporarily locked. Please contact support for assistance.';
      }
      
      if (message.includes('too many attempts')) {
        return 'Too many failed login attempts. Please wait a few minutes before trying again.';
      }
      
      if (message.includes('server error') || message.includes('internal error')) {
        return 'Server error occurred. Please try again in a few moments.';
      }
      
      if (message.includes('maintenance')) {
        return 'System is currently under maintenance. Please try again later.';
      }
      
      // Return the original message if it's user-friendly
      return error.data.message;
    }
    
    // HTTP status code errors
    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'Invalid phone number or password. Please check your credentials.';
        case 403:
          return 'Access denied. Your account may be locked or suspended.';
        case 404:
          return 'Service not found. Please try again later.';
        case 429:
          return 'Too many requests. Please wait a moment before trying again.';
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
    return 'Login failed. Please check your credentials and try again.';
  };

  const handleLogin = async () => {
    // Clear any previous errors
    setLoginError('');
    setFieldErrors({});
    
    // Validate form
    const formData: LoginFormData = {
      phoneNumber: phoneNumber.trim(),
      password: password.trim()
    };

    const validation = validateLoginForm(formData);
    
    if (!validation.isValid) {
      // Set field errors
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.error || '';
      });
      setFieldErrors(errors);
      
      // Focus on first error field
      const firstError = validation.errors[0];
      if (firstError.field === 'phoneNumber') {
        phoneInputRef.current?.focus();
      } else if (firstError.field === 'password') {
        passwordInputRef.current?.focus();
      }
      
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number for API using validation function
      const formattedPhoneNumber = cleanPhoneNumber(phoneNumber);
      const result = await login({ phone_number: formattedPhoneNumber, password }).unwrap();

      console.log('🔍 Login response:', JSON.stringify(result, null, 2));
      console.log('🔍 Token:', result.token);
      console.log('🔍 User:', result.user);
      console.log('🔍 Response keys:', Object.keys(result));

      if (result.token) {
        let userData;

        if (result.user && result.user.id) {
          console.log('🔍 Using user data from login response:', result.user);
          userData = result.user;
        } else {
          console.log('⚠️ No user data in login response, extracting from token');
          const tokenUser = extractUserFromToken(result.token);
          console.log('🔍 Extracted from token:', tokenUser);

          if (tokenUser) {
            userData = {
              id: tokenUser.id,
              name: '',
              phone_number: phoneNumber,
              type: tokenUser.type,
              is_verified: false,
              isotpVerified: false,
            };
            console.log('🔍 Created user from token:', userData);
          } else {
            throw new Error('Could not extract user from token');
          }
        }

        // Store credentials in Redux store and persist to storage
        await dispatch(
          setCredentialsAndPersist({
            user: userData,
            token: result.token,
          })
        ).unwrap();

        // Set userId to trigger vendor status query
        setUserId(userData.id);
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = parseLoginError(error);
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger routing after vendor status is fetched
  React.useEffect(() => {
    if (userId) {
      checkVendorStatusAndRoute();
    }
  }, [userId, vendorStatusData, vendorStatusLoading, vendorStatusError]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      {/* <View style={styles.header}> */}
        {/* <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity> */}
        {/* <Text style={styles.headerTitle}>Vendor Login</Text>
        <View style={{ width: 40 }} />
      </View> */}

      {/* Logo and Welcome */}
      <View style={styles.logoSection}>
      <Image source={require('@/assets/images/Zare-logo.png')} style={styles.logoContainer} />
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitleText}>Log in to your vendor account</Text>
      </View>

      {/* Login Form */}
      <View style={styles.inputSection}>
        {/* Login Error Display */}
        {loginError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.loginErrorText}>{loginError}</Text>
            <TouchableOpacity 
              onPress={() => setLoginError('')}
              style={styles.errorDismissButton}
            >
              <Text style={styles.errorDismissText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Phone Number Input */}
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.inputContainer}>
  <Text style={styles.phonePrefix}>+251</Text>
  <TextInput
    ref={phoneInputRef}
    style={styles.textInput}
    placeholder="Enter your phone number"
    value={phoneNumber}
    onChangeText={(value) => handleFieldChange('phoneNumber', value)}
    onBlur={() => handleFieldBlur('phoneNumber')}
    keyboardType="phone-pad"
    maxLength={9} // 9 digits after +251
    autoCapitalize="none"
    autoCorrect={false}
    underlineColorAndroid="transparent"
    autoComplete="tel"
    inputMode="tel"
  />
</View>

        {fieldErrors.phoneNumber && (
          <Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text>
        )}

        {/* Password Input */}
        <Text style={styles.inputLabel}>Password</Text>
<View style={[
  styles.inputContainer,
  fieldErrors.password && styles.inputContainerError
]}>
  <Lock size={20} color={fieldErrors.password ? COLORS.error : COLORS.textLight} />

  <TextInput
    ref={passwordInputRef}
    style={styles.textInput}
    placeholder="Enter your password"
    value={password}
    onChangeText={(value) => handleFieldChange('password', value)}
    onBlur={() => handleFieldBlur('password')}
    secureTextEntry={!showPassword}   // 👈 toggle here
    autoCapitalize="none"
    autoCorrect={false}
    underlineColorAndroid="transparent"
    autoComplete="current-password"
    inputMode="text"
  />

  {/* Eye toggle button */}
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    {showPassword ? (
      <EyeOff size={20} color={COLORS.textLight} />
    ) : (
      <Eye size={20} color={COLORS.textLight} />
    )}
  </TouchableOpacity>
</View>
{fieldErrors.password && (
  <Text style={styles.errorText}>{fieldErrors.password}</Text>
)}

<TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
</TouchableOpacity>


<CustomButton
  title="Log In"
  onPress={handleLogin}
  loading={isLoading}
  style={styles.loginButton}
/>

      </View>
  <View style={styles.orTextContainer}>
    <Text style={styles.orText}>Or</Text>
  </View>


      {/* Sign Up Button */}
      <View style={styles.signUpSection}>
        <CustomButton
          title="Create Account"
          onPress={() => router.push('/auth/register')}
          style={styles.signUpButton}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({  
  orTextContainer:{
    alignItems: 'center',
  },
  orText:{
    alignItems: 'center',
  },
  forgotPassword: {
    alignItems: 'start',
    
    paddingVertical: SIZES.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',   // <-- center horizontally
  },
  
  logoSection: {
    alignItems: 'center',
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xl,
  },
  logoContainer: {
    width: 200,             // necessary for the logo size
    height: 100,            // necessary for the logo size
    alignItems: 'center',   // center the logo horizontally
    justifyContent: 'center', // center the logo vertically
    backgroundColor: COLORS.primary, // if you want a colored background
  },
  
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  inputSection: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: '#fef2f2',
  },
  /* globals.css */



  
    textInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    outlineWidth : 0,
    outlineColor: 'transparent',
    outlineStyle: 'none',
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    textDecorationLine: 'none',
    WebkitAppearance : 'none',
    MozAppearance: 'none',
    appearance: 'none',
    boxShadow: 'none',
    WebkitBoxShadow: 'none',
    MozBoxShadow: 'none',

    ':focus': {
      outline : 'none',
      borderColor : 'transparent',
      boxShadow: 'none',
    },

  },
  
  

  loginButton: {
    marginTop: SIZES.md,
  },
  signUpSection: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  signUpButton: {
    marginTop: SIZES.lg,
  },
  phonePrefix: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: SIZES.sm,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SIZES.xl,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: -SIZES.md,
    marginBottom: SIZES.sm,
    marginLeft: SIZES.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  loginErrorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: SIZES.sm,
    flex: 1,
    lineHeight: 20,
  },
  errorDismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.sm,
  },
  errorDismissText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },

});
