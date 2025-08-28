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
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const phoneInputRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
      otpInputRef.current?.focus();
      Alert.alert('Success', 'OTP sent to your phone number');
    }, 2000);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter the 4-digit OTP');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  const handleResendOtp = () => {
    handleSendOtp();
  };

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

      {/* Phone Number Input */}
      {!isOtpSent && (
        <View style={styles.inputSection}>
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
            />
          </View>
          
          <CustomButton
            title="Send OTP"
            onPress={handleSendOtp}
            loading={isLoading}
            style={styles.sendOtpButton}
          />
        </View>
      )}

      {/* OTP Input */}
      {isOtpSent && (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Enter OTP</Text>
          <Text style={styles.otpSubtext}>
            We've sent a 4-digit code to {phoneNumber}
          </Text>
          
          <View style={styles.otpContainer}>
            <TextInput
              ref={otpInputRef}
              style={styles.otpInput}
              placeholder="0000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />
          </View>

          <CustomButton
            title="Verify OTP"
            onPress={handleVerifyOtp}
            loading={isLoading}
            style={styles.verifyOtpButton}
          />

          <TouchableOpacity 
            style={styles.resendContainer}
            onPress={handleResendOtp}
            disabled={isLoading}
          >
            <Text style={styles.resendText}>
              Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  sendOtpButton: {
    marginBottom: SIZES.lg,
  },
  otpSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    width: 120,
    textAlign: 'center',
  },
  verifyOtpButton: {
    marginBottom: SIZES.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: '600',
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
