import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { ArrowLeft, User, Phone } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import { styles } from './register.styles';
import CustomButton from '@/components/CustomButton';
import { useLoginMutation, useRegisterVendorOwnerMutation, useVerifyOtpMutation } from '@/services/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';

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
  const [registerVendor, { isLoading: isRegistering }] = useRegisterVendorOwnerMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.phoneNumber || !formData.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      handleSubmit();
    } else if (step === 2) {
      handleVerifyOtp();
    }
  };

  const handleSubmit = async () => {
    try {
      await registerVendor({
        name: formData.fullName,
        phone_number: formData.phoneNumber,
        password: formData.password,
        email: formData.email || undefined,
        picture: picture || undefined,
      }).unwrap();
      setStep(2);
    } catch (e: any) {
      Alert.alert('Error', e?.data?.message || 'Failed to register.');
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
    if (!formData.otpCode) {
      Alert.alert('Error', 'Enter the OTP code sent to your phone');
      return;
    }
    try {
      await verifyOtp({ phone_number: formData.phoneNumber, code: formData.otpCode }).unwrap();
      const loggedIn = await login({ phone_number: formData.phoneNumber, password: formData.password }).unwrap();
      dispatch(setCredentials({ user: loggedIn.user ?? null, token: loggedIn.token }));
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e?.data?.message || 'OTP verification or login failed.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Create your account</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={styles.inputContainer}>
          <User size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(value) => updateFormData('fullName', value)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={styles.inputContainer}>
          <Phone size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData('phoneNumber', value)}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email (optional)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Only phone number, name and password required */}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter a strong password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
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
      <Text style={styles.stepSubtitle}>Enter the OTP sent to {formData.phoneNumber}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>OTP Code *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="6-digit code"
            value={formData.otpCode}
            onChangeText={(value) => updateFormData('otpCode', value)}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
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
