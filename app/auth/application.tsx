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
import { ArrowLeft, Camera, ChevronDown, X, Building2, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';
import { useCreateIndividualVendorMutation, useCreateBusinessVendorMutation, useGetCategoriesQuery, useGetSubscriptionsQuery } from '@/services/applicationApi';
import { useAppSelector } from '@/store/hooks';
import * as ImagePicker from 'expo-image-picker';

export default function ApplicationScreen() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubscriptionDropdown, setShowSubscriptionDropdown] = useState(false);

  const user = useAppSelector(state => state.auth.user);
  const [createIndividualVendor] = useCreateIndividualVendorMutation();
  const [createBusinessVendor] = useCreateBusinessVendorMutation();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useGetSubscriptionsQuery();

  const handleImagePicker = async (type: 'cover' | 'fayda' | 'business_license') => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (type === 'cover') {
          setCoverImage(asset);
        } else if (type === 'fayda') {
          setFaydaImage(asset);
        } else if (type === 'business_license') {
          setBusinessLicenseImage(asset);
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
    } else if (type === 'fayda') {
      setFaydaImage(null);
    } else if (type === 'business_license') {
      setBusinessLicenseImage(null);
    }
  };

  const createPaymentMethodJSON = () => {
    return JSON.stringify({
      name: paymentMethod || 'Mobile Payment',
      account_number: accountNumber,
      account_holder: accountHolder,
      type: paymentProvider || 'Mobile Money',
      details: {
        provider: paymentProvider || 'Mobile Payment',
        branch: 'Addis Ababa',
        notes: 'Use this account for all mobile payments.'
      }
    });
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    
    if (!name.trim()) {
      console.log('Name validation failed');
      Alert.alert('Error', 'Please enter your business name');
      return;
    }

    if (!coverImage) {
      console.log('Cover image validation failed');
      Alert.alert('Error', 'Please upload a cover image');
      return;
    }

    if (vendorType === 'individual' && !faydaImage) {
      console.log('Fayda image validation failed');
      Alert.alert('Error', 'Please upload a Fayda image');
      return;
    }

    if (vendorType === 'business' && !businessLicenseImage) {
      console.log('Business license validation failed');
      Alert.alert('Error', 'Please upload a business license image');
      return;
    }

    if (!selectedCategory) {
      console.log('Category validation failed');
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!selectedSubscription) {
      console.log('Subscription validation failed');
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    if (!accountNumber.trim() || !accountHolder.trim() || !paymentProvider.trim()) {
      console.log('Payment method validation failed');
      Alert.alert('Error', 'Please fill in all payment method details');
      return;
    }

    if (!user?.id) {
      console.log('User not authenticated');
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    console.log('All validation passed, submitting...');
    setIsLoading(true);

    try {
      const paymentMethodJSON = createPaymentMethodJSON();
      console.log('Payment method JSON:', paymentMethodJSON);
      
      if (vendorType === 'individual') {
        console.log('Submitting individual vendor...');
        
        const formData = new FormData();
        formData.append('name', name.trim());
        
        // Append actual files
        if (coverImage) {
          formData.append('cover_image', {
            uri: coverImage.uri,
            type: 'image/jpeg',
            name: 'cover_image.jpg'
          } as any);
        }
        
        if (faydaImage) {
          formData.append('fayda_image', {
            uri: faydaImage.uri,
            type: 'image/jpeg',
            name: 'fayda_image.jpg'
          } as any);
        }
        
        formData.append('user_id', user.id);
        formData.append('category_ids', `[${selectedCategory}]`);
        formData.append('payment_method', paymentMethodJSON);
        formData.append('subscription_id', selectedSubscription);

        const result = await createIndividualVendor(formData).unwrap();
        console.log('Individual vendor result:', result);

        if (result.success) {
          Alert.alert(
            'Success', 
            'Your individual vendor application has been submitted successfully!',
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
      } else {
        console.log('Submitting business vendor...');
        
        const formData = new FormData();
        formData.append('name', name.trim());
        
        if (coverImage) {
          formData.append('cover_image', {
            uri: coverImage.uri,
            type: 'image/jpeg',
            name: 'cover_image.jpg'
          } as any);
        }
        
        if (businessLicenseImage) {
          formData.append('business_license_image', {
            uri: businessLicenseImage.uri,
            type: 'image/jpeg',
            name: 'business_license_image.jpg'
          } as any);
        }
        
        formData.append('user_id', user.id);
        formData.append('category_ids', `[${selectedCategory}]`);
        formData.append('payment_method', paymentMethodJSON);
        formData.append('subscription_id', selectedSubscription);

        const result = await createBusinessVendor(formData).unwrap();
        console.log('Business vendor result:', result);

        if (result.success) {
          Alert.alert(
            'Success', 
            'Your business vendor application has been submitted successfully!',
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
      Alert.alert(
        'Submission Failed', 
        error?.data?.message || 'Failed to submit application. Please try again.'
      );
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Application</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Vendor Type Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Vendor Type *</Text>
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
              <Building2 size={20} color={vendorType === 'business' ? COLORS.white : COLORS.textLight} />
              <Text style={[
                styles.vendorTypeText,
                vendorType === 'business' && styles.vendorTypeTextActive
              ]}>
                Business
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Business Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your business name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Cover Image */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Cover Image *</Text>
          {coverImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: coverImage.uri }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage('cover')}
              >
                <X size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={() => handleImagePicker('cover')}
            >
              <Camera size={24} color={COLORS.primary} />
              <Text style={styles.imageUploadText}>Upload Cover Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fayda Image (Individual) or Business License (Business) */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            {vendorType === 'individual' ? 'Fayda Image *' : 'Business License Image *'}
          </Text>
          {vendorType === 'individual' ? (
            faydaImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: faydaImage.uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage('fayda')}
                >
                  <X size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={() => handleImagePicker('fayda')}
              >
                <Camera size={24} color={COLORS.primary} />
                <Text style={styles.imageUploadText}>Upload Fayda Image</Text>
              </TouchableOpacity>
            )
          ) : (
            businessLicenseImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: businessLicenseImage.uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage('business_license')}
                >
                  <X size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={() => handleImagePicker('business_license')}
              >
                <Camera size={24} color={COLORS.primary} />
                <Text style={styles.imageUploadText}>Upload Business License</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Business Category *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
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
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Subscription Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Subscription Plan *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
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
                    setShowSubscriptionDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{subscription.plan}</Text>
                  <Text style={styles.subscriptionPrice}>${subscription.amount}/{subscription.status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Payment Method Details */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Payment Method Details *</Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="Payment method name (e.g., CBE Mobile Payment)"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            autoCapitalize="words"
          />
          
          <TextInput
            style={[styles.textInput, styles.marginTop]}
            placeholder="Account number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={[styles.textInput, styles.marginTop]}
            placeholder="Account holder name"
            value={accountHolder}
            onChangeText={setAccountHolder}
            autoCapitalize="words"
          />
          
          <TextInput
            style={[styles.textInput, styles.marginTop]}
            placeholder="Payment provider (e.g., Mobile Money, Bank)"
            value={paymentProvider}
            onChangeText={setPaymentProvider}
            autoCapitalize="words"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <CustomButton
            title="Submit Application"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    fontSize: 16,
    color: COLORS.text,
  },
  marginTop: {
    marginTop: SIZES.base,
  },
  vendorTypeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  vendorTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base,
  },
  vendorTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  vendorTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginLeft: SIZES.base,
  },
  vendorTypeTextActive: {
    color: COLORS.white,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  imageUploadText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SIZES.base,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: SIZES.base,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.radius,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.red,
    borderRadius: SIZES.radius,
    padding: 5,
    zIndex: 1,
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
    color: COLORS.textLight,
  },
  dropdownButtonTextPlaceholder: {
    color: COLORS.textGray,
  },
  dropdownButtonTextSelected: {
    color: COLORS.text,
    fontWeight: 'bold',
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
    color: COLORS.text,
  },
  subscriptionPrice: {
    fontSize: 14,
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
