import React, { useRef, useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, TextInput, Alert, Platform, StyleSheet } from 'react-native';
import { ArrowLeft, Phone, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { COLORS, SIZES } from '@/constants/theme';
import { useRequestPasswordResetMutation, useVerifyResetOtpMutation, useResetPasswordMutation } from '@/services/authApi';
import { cleanPhoneNumber } from '@/validations/login_validation';

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const phoneInputRef = useRef<TextInput>(null);
  const [requestPasswordReset, { isLoading: isRequesting }] = useRequestPasswordResetMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const otpInputRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validate = (): boolean => {
    const trimmed = phoneNumber.trim();
    if (trimmed.length !== 9 || !/^\d{9}$/.test(trimmed)) {
      setError('Enter a valid 9-digit phone number starting with 9');
      phoneInputRef.current?.focus();
      return false;
    }
    setError('');
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      const phone_number = cleanPhoneNumber(phoneNumber);
      await requestPasswordReset({ phone_number }).unwrap();
      setStep(2);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (e) {
      Alert.alert('Error', 'Failed to request password reset. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep2 = (): boolean => {
    if (!/^\d{4,8}$/.test(otpCode.trim())) {
      setError('Enter the 4-8 digit OTP code sent to your phone');
      otpInputRef.current?.focus();
      return false;
    }
    setError('');
    return true;
  };

  const submitVerify = async () => {
    if (!validateStep2()) return;
    try {
      setIsLoading(true);
      const phone_number = cleanPhoneNumber(phoneNumber);
      const result = await verifyResetOtp({ phone_number, otp: otpCode.trim() }).unwrap();
      setResetToken(result.resetToken);
      setStep(3);
      setTimeout(() => newPasswordRef.current?.focus(), 100);
    } catch (e) {
      Alert.alert('Error', 'Invalid or expired OTP. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep3 = (): boolean => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      newPasswordRef.current?.focus();
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      confirmPasswordRef.current?.focus();
      return false;
    }
    setError('');
    return true;
  };

  const submitReset = async () => {
    if (!validateStep3()) return;
    try {
      setIsLoading(true);
      await resetPassword({ new_password: newPassword, resetToken }).unwrap();
      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to reset password. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.errorTextMsg}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')} style={styles.errorDismissButton}>
              <Text style={styles.errorDismissText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 1 && (
          <>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.phonePrefix}>+251</Text>
              <TextInput
                ref={phoneInputRef}
                style={styles.textInput}
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={(v) => setPhoneNumber(v)}
                onBlur={validate}
                keyboardType="phone-pad"
                maxLength={9}
                autoCapitalize="none"
                autoCorrect={false}
                underlineColorAndroid="transparent"
                autoComplete="tel"
                inputMode="tel"
              />
            </View>

            <CustomButton title="Request Reset" onPress={submit} loading={isLoading || isRequesting} style={styles.submitButton} />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Enter OTP</Text>
            <Text style={styles.inputLabel}>OTP Code</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={otpInputRef}
                style={styles.textInput}
                placeholder="Enter the 4-8 digit code"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={8}
                autoCapitalize="none"
              />
            </View>
            <CustomButton title="Verify OTP" onPress={submitVerify} loading={isLoading || isVerifying} style={styles.submitButton} />
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Set New Password</Text>

            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputContainer}> 
              <TextInput
                ref={newPasswordRef}
                style={styles.textInput}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}> 
              <TextInput
                ref={confirmPasswordRef}
                style={styles.textInput}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <CustomButton title="Reset Password" onPress={submitReset} loading={isLoading || isResetting} style={styles.submitButton} />
          </>
        )}
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
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  content: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
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
  textInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    textDecorationLine: 'none',
    ...(Platform.select({ web: ({ outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as any) })),
  },
  phonePrefix: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: SIZES.sm,
  },
  submitButton: {
    marginTop: SIZES.sm,
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
  errorTextMsg: {
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
