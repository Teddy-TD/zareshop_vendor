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
} from 'react-native';
import { ArrowLeft, Phone, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Track user ID after login

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

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ phone_number: phoneNumber, password }).unwrap();

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
      Alert.alert(
        'Login Failed',
        error?.data?.message || 'Invalid phone number or password. Please try again.'
      );
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Login</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Logo and Welcome */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ZareShop</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitleText}>Sign in to your vendor account</Text>
      </View>

      {/* Login Form */}
      <View style={styles.inputSection}>
        {/* Phone Number Input */}
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <Phone size={20} color={COLORS.textLight} />
          <TextInput
            ref={phoneInputRef}
            style={styles.textInput}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputContainer}>
          <Lock size={20} color={COLORS.textLight} />
          <TextInput
            ref={passwordInputRef}
            style={styles.textInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <CustomButton
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          New to ZareShop?{' '}
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.footerLink}>Create account</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
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
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
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
  },
  textInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  loginButton: {
    marginTop: SIZES.md,
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
});
