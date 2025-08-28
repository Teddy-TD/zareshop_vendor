import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { ArrowLeft, User, Building, Camera, Upload, MapPin, Phone, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [vendorType, setVendorType] = useState<'individual' | 'business'>('individual');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    storeName: '',
    storeDescription: '',
    address: '',
    city: '',
    businessLicense: '',
    faydaId: '',
    paymentMethod: '',
    accountNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.phoneNumber || !formData.email) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.storeName || !formData.storeDescription || !formData.address) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (vendorType === 'business' && !formData.businessLicense) {
        Alert.alert('Error', 'Please upload business license');
        return;
      }
      if (vendorType === 'individual' && !formData.faydaId) {
        Alert.alert('Error', 'Please upload Fayda ID');
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Registration Submitted',
        'Your vendor account has been submitted for admin approval. You will be notified once approved.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/pending-approval')
          }
        ]
      );
    }, 2000);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
      
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
        <Text style={styles.inputLabel}>Email Address *</Text>
        <View style={styles.inputContainer}>
          <Mail size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Store Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your business</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Store Name *</Text>
        <View style={styles.inputContainer}>
          <Building size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your store name"
            value={formData.storeName}
            onChangeText={(value) => updateFormData('storeName', value)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Store Description *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your store and what you sell"
            value={formData.storeDescription}
            onChangeText={(value) => updateFormData('storeDescription', value)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address *</Text>
        <View style={styles.inputContainer}>
          <MapPin size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your store address"
            value={formData.address}
            onChangeText={(value) => updateFormData('address', value)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>City</Text>
        <View style={styles.inputContainer}>
          <MapPin size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your city"
            value={formData.city}
            onChangeText={(value) => updateFormData('city', value)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verification & Payment</Text>
      <Text style={styles.stepSubtitle}>Complete your setup</Text>
      
      {/* Vendor Type Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vendor Type</Text>
        <View style={styles.vendorTypeContainer}>
          <TouchableOpacity
            style={[
              styles.vendorTypeButton,
              vendorType === 'individual' && styles.vendorTypeButtonActive
            ]}
            onPress={() => setVendorType('individual')}
          >
            <User size={20} color={vendorType === 'individual' ? COLORS.white : COLORS.textLight} />
            <Text style={[
              styles.vendorTypeText,
              vendorType === 'individual' && styles.vendorTypeTextActive
            ]}>
              Individual
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.vendorTypeButton,
              vendorType === 'business' && styles.vendorTypeButtonActive
            ]}
            onPress={() => setVendorType('business')}
          >
            <Building size={20} color={vendorType === 'business' ? COLORS.white : COLORS.textLight} />
            <Text style={[
              styles.vendorTypeText,
              vendorType === 'business' && styles.vendorTypeTextActive
            ]}>
              Business
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Document Upload */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {vendorType === 'business' ? 'Business License *' : 'Fayda ID *'}
        </Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Upload size={20} color={COLORS.primary} />
          <Text style={styles.uploadText}>
            {vendorType === 'business' ? 'Upload Business License' : 'Upload Fayda ID'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Details */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Payment Method</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Bank Transfer / Mobile Money"
            value={formData.paymentMethod}
            onChangeText={(value) => updateFormData('paymentMethod', value)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Number</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChangeText={(value) => updateFormData('accountNumber', value)}
          />
        </View>
      </View>
    </View>
  );

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
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
          title={step === 3 ? 'Submit Application' : 'Next'}
          onPress={handleNext}
          loading={isLoading}
          style={styles.nextButton}
        />
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
  progressContainer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SIZES.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  stepContainer: {
    paddingBottom: SIZES.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
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
  },
  textInput: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  vendorTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vendorTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md,
    marginHorizontal: SIZES.xs,
  },
  vendorTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  vendorTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  vendorTypeTextActive: {
    color: COLORS.white,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  uploadText: {
    marginLeft: SIZES.sm,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    padding: SIZES.md,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
    paddingHorizontal: SIZES.md,
  },
  nextButton: {
    flex: 1,
  },
});
