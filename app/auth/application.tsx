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
  ScrollView,
  Image,
} from 'react-native';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { ArrowLeft, Camera, ChevronDown, X, Building2, User } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';
import ImageUploader from '@/components/Image_Uploader';
import { useCreateIndividualVendorMutation, useCreateBusinessVendorMutation, useGetCategoriesQuery, useGetSubscriptionsQuery, useGetUserVendorStatusQuery, useCreateRegistrationPaymentMutation } from '@/services/applicationApi';
import { useAppSelector } from '@/store/hooks';
import * as ImagePicker from 'expo-image-picker';

export default function ApplicationScreen() {
  const { payment_id } = useLocalSearchParams();
  const existingPaymentId = payment_id ? Number(payment_id) : null;
  
  const [step, setStep] = useState<1 | 2>(1);
  const [vendorType, setVendorType] = useState<'individual' | 'business'>('individual');
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [faydaImage, setFaydaImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [businessLicenseImage, setBusinessLicenseImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [paymentProvider, setPaymentProvider] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubscriptionDropdown, setShowSubscriptionDropdown] = useState(false);
  const [showPaymentProviderDropdown, setShowPaymentProviderDropdown] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const user = useAppSelector(state => state.auth.user);
  const [createIndividualVendor] = useCreateIndividualVendorMutation();
  const [createBusinessVendor] = useCreateBusinessVendorMutation();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useGetSubscriptionsQuery();
  const { refetch: refetchVendorStatus } = useGetUserVendorStatusQuery(undefined, { skip: true });
  const [createRegistrationPayment] = useCreateRegistrationPaymentMutation();

  // Payment provider options based on backend validation
  const paymentProviderOptions = [
    { value: 'bank_transfer', label: 'Bank Transfer (CBE, Dashen, etc.)' },
    { value: 'mobile_money', label: 'Mobile Money (Telebirr, M-Birr)' },
    { value: 'cash', label: 'Cash Payment' },
    { value: 'check', label: 'Check Payment' },
  ];

  const getPaymentProviderLabel = (value: string) => {
    const option = paymentProviderOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const checkVendorStatusAndRoute = async () => {
    try {
      const result = await refetchVendorStatus();
      if (result.data) {
        const { hasVendor, vendor } = result.data as any;
        if (!hasVendor) {
          router.replace('/auth/application');
        } else if (vendor && !vendor.isApproved) {
          router.replace('/auth/pending-approval');
        } else if (vendor && vendor.isApproved) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/application');
        }
      } else {
        router.replace('/auth/application');
      }
    } catch (error) {
      router.replace('/auth/application');
    }
  };

  const handleImagePicker = async (type: 'cover' | 'fayda' | 'business_license') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (type === 'cover') {
          setCoverImage(asset);
          setFieldErrors(prev => ({ ...prev, coverImage: '' }));
        } else if (type === 'fayda') {
          setFaydaImage(asset);
          setFieldErrors(prev => ({ ...prev, faydaImage: '' }));
        } else if (type === 'business_license') {
          setBusinessLicenseImage(asset);
          setFieldErrors(prev => ({ ...prev, businessLicenseImage: '' }));
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (type: 'cover' | 'fayda' | 'business_license') => {
    if (type === 'cover') {
      setCoverImage(null);
      setFieldErrors(prev => ({ ...prev, coverImage: 'Cover image is required' }));
    } else if (type === 'fayda') {
      setFaydaImage(null);
      setFieldErrors(prev => ({ ...prev, faydaImage: 'Fayda image is required' }));
    } else if (type === 'business_license') {
      setBusinessLicenseImage(null);
      setFieldErrors(prev => ({ ...prev, businessLicenseImage: 'Business license is required' }));
    }
  };

  const normalizeUploadFile = async (
    asset: ImagePicker.ImagePickerAsset,
    fallbackPrefix: string
  ): Promise<any> => {
    const guessedExtension = ((asset as any).mimeType || '').split('/')[1] || (asset.uri.split('.').pop() || 'jpg');
    const name = (asset as any).fileName || `${fallbackPrefix}_${Date.now()}.${guessedExtension}`;
    const type = (asset as any).mimeType || 'image/jpeg';
    let uri = asset.uri;

    if (Platform.OS === 'web') {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], name, { type });
        return file;
      } catch (e) {
        console.warn('Failed converting data URI to Blob File; fallback to native descriptor', e);
        return { uri, name, type };
      }
    } else {
      if (uri && !uri.startsWith('file://')) {
        const dest = `${FileSystem.cacheDirectory}${name}`;
        try {
          await FileSystem.copyAsync({ from: uri, to: dest });
          uri = dest;
        } catch (e) {
          console.warn('Failed to copy image to cache directory, using original URI', e);
        }
      }
      return { uri, name, type };
    }
  };

  const createPaymentMethodJSON = () => {
    return JSON.stringify({
      name: paymentMethod,
      account_number: accountNumber,
      account_holder: accountHolder,
      // optional per backend schema (allow null, '')
      type: paymentProvider || '',
      // backend defaults to {}; send minimal
      details: {}
    });
  };

  const mapApiErrorToField = (message: string): keyof typeof fieldErrors | null => {
    const msg = message.toLowerCase();
    if (msg.includes('vendor name') || msg.includes('business name')) return 'name';
    if (msg.includes('cover')) return 'coverImage';
    if (msg.includes('fayda')) return 'faydaImage';
    if (msg.includes('license')) return 'businessLicenseImage';
    if (msg.includes('category')) return 'selectedCategory';
    if (msg.includes('subscription')) return 'selectedSubscription';
    if (msg.includes('payment method')) return 'paymentMethod';
    if (msg.includes('account number')) return 'accountNumber';
    if (msg.includes('account holder')) return 'accountHolder';
    if (msg.includes('address_line1') || msg.includes('address line1') || msg.includes('address')) return 'addressLine1';
    return null;
  };

  const validateField = (field: string, value: string | ImagePicker.ImagePickerAsset | null) => {
    let error = '';
    if (field === 'name' && (!value || (typeof value === 'string' && !value.trim()))) {
      error = 'Business name is required';
    } else if (field === 'name' && typeof value === 'string' && value.length < 3) {
      error = 'Business name must be at least 3 characters';
    } else if (field === 'coverImage' && !value) {
      error = 'Cover image is required';
    } else if (field === 'faydaImage' && vendorType === 'individual' && !value) {
      error = 'Fayda image is required';
    } else if (field === 'businessLicenseImage' && vendorType === 'business' && !value) {
      error = 'Business license is required';
    } else if (field === 'selectedCategory' && !value) {
      error = 'Please select a category';
    } else if (field === 'selectedSubscription' && !value) {
      error = 'Please select a subscription plan';
    } else if (field === 'paymentMethod' && (!value || (typeof value === 'string' && !value.trim()))) {
      error = 'Payment method name is required';
    } else if (field === 'accountNumber' && (!value || (typeof value === 'string' && !value.trim()))) {
      error = 'Account number is required';
    } else if (field === 'accountHolder' && (!value || (typeof value === 'string' && !value.trim()))) {
      error = 'Account holder name is required';
    } else if (field === 'paymentProvider' && (!value || (typeof value === 'string' && !value.trim()))) {
      error = 'Please select a payment provider';
    } else if (field === 'addressLine1' && (!value || (typeof value === 'string' && value.trim().length < 3))) {
      error = 'Address line1 is required';
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    errors.name = validateField('name', name);
    errors.coverImage = validateField('coverImage', coverImage);
    if (vendorType === 'individual') {
      errors.faydaImage = validateField('faydaImage', faydaImage);
    } else {
      errors.businessLicenseImage = validateField('businessLicenseImage', businessLicenseImage);
    }
    errors.selectedCategory = validateField('selectedCategory', selectedCategory);
    // errors.selectedSubscription = validateField('selectedSubscription', selectedSubscription);
    errors.paymentMethod = validateField('paymentMethod', paymentMethod);
    errors.accountNumber = validateField('accountNumber', accountNumber);
    errors.accountHolder = validateField('accountHolder', accountHolder);
    // Payment provider is now required
    errors.paymentProvider = validateField('paymentProvider', paymentProvider);
    errors.addressLine1 = validateField('addressLine1', addressLine1);
    return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v)) as Record<string, string>;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    if (!user?.id) {
      console.log('User not authenticated');
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      if (step === 1) setStep(2);
      const fieldLabels: Record<string, string> = {
        name: 'Business name',
        coverImage: 'Cover image',
        faydaImage: 'Fayda image',
        businessLicenseImage: 'Business license image',
        selectedCategory: 'Business category',
        selectedSubscription: 'Subscription plan',
        paymentMethod: 'Payment method name',
        accountNumber: 'Account number',
        accountHolder: 'Account holder name',
        paymentProvider: 'Payment provider',
        addressLine1: 'Address line1',
      };
      const list = Object.keys(errors)
        .map((key) => `• ${fieldLabels[key] || key}: ${errors[key]}`)
        .join('\n');
      Alert.alert('Please fix the following', list);
      return;
    }

    console.log('All validation passed, submitting...');
    setIsLoading(true);

    try {
      const paymentMethodJSON = createPaymentMethodJSON();
      // console.log('Payment method JSON:', paymentMethodJSON);

      let paymentId = existingPaymentId;
      let paymentResponse = null;

      // Use existing payment ID if available, otherwise create new payment
      if (!paymentId) {
        console.log('Creating new registration payment...');
        paymentResponse = await createRegistrationPayment({
          user_id: Number(user.id),
          subscription_id: Number(selectedSubscription),
          payment_method: 'manual',
          payment_provider: paymentProvider || undefined as any,
        }).unwrap();
        paymentId = paymentResponse?.data?.payment?.id;
        if (!paymentId) {
          throw new Error('Failed to create payment. Please try again.');
        }
      } else {
        console.log('Using existing payment ID:', paymentId);
        // For existing payments, assume they are completed since we're coming from payment flow
        paymentResponse = { data: { payment: { id: paymentId, status: 'completed' } } };
      }

      if (vendorType === 'individual') {
        console.log('Submitting individual vendor...');
        const formData = new FormData();
        formData.append('name', name.trim());
        if (coverImage) {
          console.log('🔍 Appending cover_image:', coverImage);
          const uploadFile = await normalizeUploadFile(coverImage, 'cover');
          formData.append('cover_image', uploadFile as any);
        }
        if (faydaImage) {
          console.log('🔍 Appending fayda_image:', faydaImage);
          const uploadFile = await normalizeUploadFile(faydaImage, 'fayda');
          formData.append('fayda_image', uploadFile as any);
        }
        console.log('done a few')
        formData.append('category_ids', JSON.stringify([Number(selectedCategory)]));
        formData.append('payment_method', paymentMethodJSON);
        formData.append('subscription_id', String(Number(selectedSubscription)));
        formData.append('address_line1', addressLine1.trim());
        formData.append('payment_id', String(paymentId));
        console.log('done a lot')

        try {
          console.log('Sending request to create individual vendor...');
          console.log('FormData contents:');
          // Log formData contents for debugging (RN FormData lacks entries())
          const appendedKeys = [
            'name',
            ...(coverImage ? ['cover_image'] : []),
            ...(faydaImage ? ['fayda_image'] : []),
            'category_ids',
            'payment_method',
            'subscription_id',
            'address_line1',
            'payment_id',
          ];
          const canIterate = typeof (formData as any).entries === 'function' && Platform.OS === 'web';
          if (canIterate) {
            for (const pair of (formData as any).entries()) {
              const [key, value] = pair as [string, any];
              if (typeof File !== 'undefined' && value instanceof File) {
                console.log(`${key}:`, { name: value.name, type: value.type, size: value.size });
              } else {
                console.log(`${key}:`, value);
              }
            }
          } else {
            console.log('FormData prepared (no entries support). Keys:', appendedKeys);
          }
          
          console.log('Initiating API call...');
          console.log('Env/base URL/platform:', {
            baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
            platform: Platform.OS,
          });

          // Apply a 30s timeout and abort the mutation if it takes too long
          const mutationPromise = createIndividualVendor(formData);
          const abortable: any = mutationPromise;
          const result = await Promise.race([
            mutationPromise.unwrap(),
            new Promise<never>((_, reject) =>
              setTimeout(() => {
                try { if (typeof abortable?.abort === 'function') abortable.abort(); } catch {}
                reject(new Error('Request timed out'));
              }, 30000)
            ),
          ]).catch(error => {
            console.error('API Error Details:', {
              status: error?.status,
              data: error?.data,
              error: error?.error || error?.message,
              originalStatus: error?.originalStatus,
              statusCode: error?.statusCode,
            });
            throw error;
          });
          console.log('Individual vendor result:', result);

          if (result.success) {
            // Application submitted successfully - now waiting for admin review
            Alert.alert(
              'Application Submitted Successfully! 🎉',
              'Your complete vendor application (including payment proof and vendor details) has been submitted for admin review.\n\nYou will be notified once the admin approves your application.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/auth/pending-approval')
                }
              ]
            );
          } else {
            console.error('Vendor creation failed:', result);
            Alert.alert('Error', result.message || 'Failed to submit application');
          }
        } catch (error) {
          console.error('Error in createIndividualVendor:', error);
          Alert.alert(
            'Error',
            'An error occurred while submitting your application. Please try again.'
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('Submitting business vendor...');
        const formData = new FormData();
        formData.append('name', name.trim());
        if (coverImage) {
          console.log('🔍 Appending cover_image:', coverImage);
          const uploadFile = await normalizeUploadFile(coverImage, 'cover');
          formData.append('cover_image', uploadFile as any);
        }
        if (businessLicenseImage) {
          console.log('🔍 Appending business_license_image:', businessLicenseImage);
          const uploadFile = await normalizeUploadFile(businessLicenseImage, 'business_license');
          formData.append('business_license_image', uploadFile as any);
        }
        formData.append('category_ids', JSON.stringify([Number(selectedCategory)]));
        formData.append('payment_method', paymentMethodJSON);
        formData.append('subscription_id', String(Number(selectedSubscription)));
        formData.append('address_line1', addressLine1.trim());
        formData.append('payment_id', String(paymentId));

        const result = await createBusinessVendor(formData).unwrap();
        console.log('Business vendor result:', result);

        if (result.success) {
          // Application submitted successfully - now waiting for admin review
          Alert.alert(
            'Application Submitted Successfully! 🎉',
            'Your complete vendor application (including payment proof and vendor details) has been submitted for admin review.\n\nYou will be notified once the admin approves your application.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/auth/pending-approval')
              }
            ]
          );
        } else {
          Alert.alert('Error', result.message || 'Failed to submit application');
        }
      }
    } catch (error: any) {
      console.error('Application submission error:', error);
      const apiMessage: string | undefined = error?.data?.error || error?.data?.message || error?.message;
      if (apiMessage) {
        const newErrors: Record<string, string> = { ...fieldErrors };
        const mapped = mapApiErrorToField(apiMessage);
        if (mapped) newErrors[mapped] = apiMessage;
        setFieldErrors(newErrors);
        if (step === 1) setStep(2);
        Alert.alert('Submission Failed', apiMessage);
      } else {
        Alert.alert('Submission Failed', 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (id: string) => {
    const category = categoriesData?.find(cat => cat.id === id);
    return category?.name || 'Select Category';
  };

  const getSubscriptionName = (id: string) => {
    const subscription = subscriptionsData?.find(sub => sub.id === id);
    return subscription?.plan || 'Select Subscription';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Application</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onTouchStart={() => {
          setShowCategoryDropdown(false);
          setShowSubscriptionDropdown(false);
          setShowPaymentProviderDropdown(false);
        }}
      >
        {step === 1 && (
          <>
            <Text style={styles.stepHeadline}>Step 1 of 2</Text>
            <Text style={styles.stepSubtitleCentered}>Choose your vendor type to continue</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioRow} onPress={() => setVendorType('individual')}>
                <View style={[styles.radioCircle, vendorType === 'individual' && styles.radioCircleActive]} />
                <Text style={styles.radioText}>Individual</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioRow} onPress={() => setVendorType('business')}>
                <View style={[styles.radioCircle, vendorType === 'business' && styles.radioCircleActive]} />
                <Text style={styles.radioText}>Business</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepHeadline}>Step 2 of 2</Text>
            <Text style={styles.stepSubtitleCentered}>Complete your vendor details</Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Business Name *</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.name && styles.inputErrorBorder]}
                placeholder="Enter your business name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  validateField('name', text);
                }}
                autoCapitalize="words"
              />
              {fieldErrors.name && <Text style={styles.errorHelperText}>{fieldErrors.name}</Text>}
            </View>

            <ImageUploader
              label="Cover Image"
              required
              image={coverImage ? { uri: coverImage.uri } : undefined}
              onPick={() => handleImagePicker('cover')}
              onRemove={() => removeImage('cover')}
              error={fieldErrors.coverImage}
            />

            <View style={styles.inputSection}>
              {vendorType === 'individual' ? (
                <ImageUploader
                  label="Fayda Image"
                  required
                  image={faydaImage ? { uri: faydaImage.uri } : undefined}
                  onPick={() => handleImagePicker('fayda')}
                  onRemove={() => removeImage('fayda')}
                  error={fieldErrors.faydaImage}
                />
              ) : (
                <ImageUploader
                  label="Business License Image"
                  required
                  image={businessLicenseImage ? { uri: businessLicenseImage.uri } : undefined}
                  onPick={() => handleImagePicker('business_license')}
                  onRemove={() => removeImage('business_license')}
                  error={fieldErrors.businessLicenseImage}
                />
              )}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Business Category *</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, fieldErrors.selectedCategory && styles.inputErrorBorder]}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={categoriesLoading}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  selectedCategory ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder
                ]}>
                  {getCategoryName(selectedCategory)}
                </Text>
                <ChevronDown size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              {showCategoryDropdown && categoriesData && (
                <View style={styles.dropdownList}>
                  {categoriesData.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCategory(category.id);
                        validateField('selectedCategory', category.id);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {fieldErrors.selectedCategory && <Text style={styles.errorHelperText}>{fieldErrors.selectedCategory}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Subscription Plan *</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, fieldErrors.selectedSubscription && styles.inputErrorBorder]}
                onPress={() => setShowSubscriptionDropdown(!showSubscriptionDropdown)}
                disabled={subscriptionsLoading}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  selectedSubscription ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder
                ]}>
                  {getSubscriptionName(selectedSubscription)}
                </Text>
                <ChevronDown size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              {showSubscriptionDropdown && subscriptionsData && (
                <View style={styles.dropdownList}>
                  {subscriptionsData.map((subscription) => (
                    <TouchableOpacity
                      key={subscription.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSubscription(subscription.id);
                        validateField('selectedSubscription', subscription.id);
                        setShowSubscriptionDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{subscription.plan}</Text>
                      <Text style={styles.subscriptionPrice}>${subscription.amount}/{subscription.status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {fieldErrors.selectedSubscription && <Text style={styles.errorHelperText}>{fieldErrors.selectedSubscription}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Address Line 1 *</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.addressLine1 && styles.inputErrorBorder]}
                placeholder="Enter your address"
                value={addressLine1}
                onChangeText={(text) => {
                  setAddressLine1(text);
                  validateField('addressLine1', text);
                }}
                autoCapitalize="sentences"
              />
              {fieldErrors.addressLine1 && <Text style={styles.errorHelperText}>{fieldErrors.addressLine1}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Payment Method Name *</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.paymentMethod && styles.inputErrorBorder]}
                placeholder="e.g., Mobile Money"
                value={paymentMethod}
                onChangeText={(text) => {
                  setPaymentMethod(text);
                  validateField('paymentMethod', text);
                }}
              />
              {fieldErrors.paymentMethod && <Text style={styles.errorHelperText}>{fieldErrors.paymentMethod}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Account Number *</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.accountNumber && styles.inputErrorBorder]}
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  validateField('accountNumber', text);
                }}
                keyboardType="number-pad"
              />
              {fieldErrors.accountNumber && <Text style={styles.errorHelperText}>{fieldErrors.accountNumber}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Account Holder *</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.accountHolder && styles.inputErrorBorder]}
                placeholder="Enter account holder name"
                value={accountHolder}
                onChangeText={(text) => {
                  setAccountHolder(text);
                  validateField('accountHolder', text);
                }}
                autoCapitalize="words"
              />
              {fieldErrors.accountHolder && <Text style={styles.errorHelperText}>{fieldErrors.accountHolder}</Text>}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Payment Provider *</Text>
              <TouchableOpacity
                style={[styles.textInput, styles.dropdownButton]}
                onPress={() => setShowPaymentProviderDropdown(!showPaymentProviderDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !paymentProvider && { color: COLORS.textLight }]}>
                  {paymentProvider ? getPaymentProviderLabel(paymentProvider) : 'Select payment provider'}
                </Text>
                <ChevronDown size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              
              {showPaymentProviderDropdown && (
                <View style={styles.dropdownList}>
                  {paymentProviderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPaymentProvider(option.value);
                        setShowPaymentProviderDropdown(false);
                        validateField('paymentProvider', option.value);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {fieldErrors.paymentProvider && <Text style={styles.errorHelperText}>{fieldErrors.paymentProvider}</Text>}
            </View>
          </>
        )}
      </ScrollView>

      <View style={{ padding: SIZES.padding }}>
        {step === 1 ? (
          <CustomButton
            title="Next"
            onPress={() => setStep(2)}
            style={styles.submitButton}
          />
        ) : (
          <View style={styles.submitSection}>
            <CustomButton
              title="Submit Application"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.padding,
  },
  inputSection: {
    marginBottom: SIZES.padding,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorHelperText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 6,
  },
  marginTop: {
    marginTop: SIZES.base,
  },
  stepHeadline: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: 4,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  stepSubtitleCentered: {
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: SIZES.md,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  radioGroup: {
    marginTop: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    backgroundColor: COLORS.lightGray,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  dropdownButtonTextPlaceholder: {
    color: COLORS.textGray,
  },
  dropdownButtonTextSelected: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginTop: SIZES.base,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  subscriptionPrice: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: SIZES.base / 2,
  },
  submitSection: {
    marginTop: SIZES.padding,
  },
  submitButton: {
    width: '100%',
  },
});