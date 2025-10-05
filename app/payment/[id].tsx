import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Upload, 
  Camera,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';

import { COLORS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import {
  useGetPaymentByIdQuery,
  useUploadPaymentProofMutation,
  useCapturePaymentProofMutation,
  useUploadPaymentProofFileMutation,
  useProceedToNextStepMutation,
  useGeneratePaymentQRCodeQuery,
  Payment,
  PaymentStatus,
} from '@/services/paymentApi';
import CustomButton from '@/components/CustomButton';
import ImageUploader from '@/components/Image_Uploader';

const PaymentDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [proofImage, setProofImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [proofImageError, setProofImageError] = useState<string>('');

  const paymentId = parseInt(id || '0');

  const {
    data: paymentData,
    isLoading: paymentLoading,
    error: paymentError,
    refetch: refetchPayment,
  } = useGetPaymentByIdQuery(paymentId, {
    skip: !paymentId,
  });

  const {
    data: qrData,
    isLoading: qrLoading,
  } = useGeneratePaymentQRCodeQuery(paymentId, {
    skip: !paymentId || paymentData?.data?.status !== 'pending',
  });

  const [uploadPaymentProof] = useUploadPaymentProofMutation();
  const [capturePaymentProof] = useCapturePaymentProofMutation();
  const [uploadPaymentProofFile] = useUploadPaymentProofFileMutation();
  const [proceedToNextStep] = useProceedToNextStepMutation();

  const payment = paymentData?.data;


  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPayment();
    setRefreshing(false);
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'failed':
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} color={COLORS.success} />;
      case 'pending':
        return <Clock size={24} color={COLORS.warning} />;
      case 'failed':
      case 'cancelled':
        return <XCircle size={24} color={COLORS.error} />;
      default:
        return <AlertCircle size={24} color={COLORS.gray} />;
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
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

  const handleImagePicker = async () => {
    console.log('🎯 Proof image picker opened');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setProofImage(asset);
        setProofImageError('');
        console.log('✅ Proof image selected:', asset.uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeProofImage = () => {
    setProofImage(null);
    setProofImageError('Payment proof image is required');
  };


  const uploadProofImage = async () => {
    if (!proofImage) {
      setProofImageError('Please select a payment proof image');
      return;
    }

    setUploadingProof(true);
    setUploadProgress(0);

    try {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (proofImage.fileSize && proofImage.fileSize > maxSize) {
        Alert.alert(
          'File Too Large',
          'Please select an image smaller than 5MB.'
        );
        return;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const formData = new FormData();
      const uploadFile = await normalizeUploadFile(proofImage, 'payment_proof');
      formData.append('proof_image', uploadFile as any);

      console.log('Uploading payment proof for payment ID:', paymentId);
      console.log('File details:', {
        uri: proofImage.uri,
        type: proofImage.mimeType,
        name: proofImage.fileName,
        size: proofImage.fileSize,
      });

      const result = await uploadPaymentProofFile({
        id: paymentId,
        data: formData,
      }).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          'Payment proof uploaded successfully. Your payment is now under review and will be processed within 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                refetchPayment();
                setUploadProgress(0);
                setProofImage(null); // Clear the selected image
              },
            },
          ]
        );
      } else {
        Alert.alert('Upload Failed', result.message || 'Failed to upload payment proof');
        setUploadProgress(0);
      }
    } catch (error: any) {
      console.error('Upload proof error:', error);
      setUploadProgress(0);
      
      let errorMessage = 'Failed to upload payment proof. Please try again.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 413) {
        errorMessage = 'File is too large. Please select a smaller image.';
      } else if (error?.status === 400) {
        errorMessage = 'Invalid file format. Please select a valid image file.';
      } else if (error?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error?.status === 403) {
        errorMessage = 'You can only upload proof for your own payments.';
      } else if (error?.status === 404) {
        errorMessage = 'Payment not found.';
      }

      Alert.alert('Upload Error', errorMessage);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleCreateVendor = () => {
    if (payment?.status === 'completed') {
      router.push('/auth/application');
    } else {
      Alert.alert(
        'Payment Required',
        'Please complete your payment before creating a vendor account.'
      );
    }
  };

  const handleProceedToNextStep = async () => {
    try {
      console.log('🚀 Starting proceed to next step...');
      const result = await proceedToNextStep({
        id: paymentId,
        force_proceed: false,
      }).unwrap();

      console.log('📋 Proceed API response:', JSON.stringify(result, null, 2));

      if (result.success) {
        const { next_step, payment } = result.data;
        
        console.log('📊 Payment status:', payment.status);
        console.log('🎯 Next step:', next_step.step);
        console.log('✅ Can proceed:', next_step.can_proceed);
        console.log('🎬 Available actions:', next_step.actions);
        
        // In the unified flow, users should submit complete applications
        // The complex action selection is no longer needed
        if (next_step.can_proceed) {
          console.log('🎯 Can proceed - navigating to application');
          navigateToScreen(`/auth/application?payment_id=${paymentId}`);
        } else {
          // Show simple guidance message
          Alert.alert(
            'Next Steps',
            next_step.message,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Error getting next step:', error);
      Alert.alert(
        'Error', 
        error?.data?.message || 'Failed to determine next step. Please try again.'
      );
    }
  };


  const navigateToScreen = (path: string) => {
    console.log(`🧭 Attempting to navigate to: ${path}`);
    
    try {
      // Use setTimeout to ensure navigation happens on next tick
      setTimeout(() => {
        console.log(`⏰ Executing delayed navigation to: ${path}`);
        
        switch (path) {
          case '/auth/application':
            console.log('📍 Navigating to application screen');
            router.push('/auth/application');
            console.log('✅ Navigation command sent for /auth/application');
            break;
          case '/auth/vendor-registration':
            console.log('📍 Navigating to vendor registration screen');
            router.push('/auth/vendor-registration');
            console.log('✅ Navigation command sent for /auth/vendor-registration');
            break;
          case '/auth/pending-approval':
            console.log('📍 Navigating to pending approval screen');
            router.push('/auth/pending-approval');
            console.log('✅ Navigation command sent for /auth/pending-approval');
            break;
          case '/(tabs)':
            console.log('📍 Navigating to main tabs (replacing current screen)');
            router.replace('/(tabs)');
            console.log('✅ Navigation command sent for /(tabs)');
            break;
          case '/payment/create':
            console.log('📍 Navigating to payment creation screen');
            router.push('/payment/create');
            console.log('✅ Navigation command sent for /payment/create');
            break;
          case '/payment/index':
            console.log('📍 Navigating to payment index screen');
            router.push('/payment/index' as any);
            console.log('✅ Navigation command sent for /payment/index');
            break;
          default:
            console.log(`🔍 Handling dynamic/unknown path: ${path}`);
            // Handle dynamic routes or fallback
            if (path.startsWith('/payment/')) {
              console.log('📍 Dynamic payment route detected');
              router.push(path as any);
              console.log(`✅ Navigation command sent for dynamic payment route: ${path}`);
            } else if (path.startsWith('/auth/')) {
              console.log('📍 Dynamic auth route detected');
              router.push(path as any);
              console.log(`✅ Navigation command sent for dynamic auth route: ${path}`);
            } else {
              console.warn(`❌ Unknown navigation path: ${path}`);
              Alert.alert('Navigation Error', `Unable to navigate to: ${path}`);
            }
        }
      }, 100); // Small delay to ensure proper execution
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', `Failed to navigate to ${path}. Error: ${error}`);
    }
  };


  const renderPaymentInstructions = () => {
    if (!payment || payment.payment_method !== 'manual') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Instructions</Text>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>
            Complete your payment using the details below:
          </Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionLabel}>Payment Reference:</Text>
            <View style={styles.copyableField}>
              <Text style={styles.instructionValue}>{payment.payment_reference}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(payment.payment_reference, 'Payment reference')}
              >
                <Copy size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionLabel}>Amount:</Text>
            <Text style={styles.instructionValue}>
              {payment.amount} {payment.currency}
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionLabel}>Provider:</Text>
            <Text style={styles.instructionValue}>{payment.payment_provider}</Text>
          </View>

          {payment.payment_provider === 'bank_transfer' && (
            <View style={styles.bankDetails}>
              <Text style={styles.bankDetailsTitle}>Bank Transfer Details:</Text>
              <Text style={styles.bankDetail}>Bank: Commercial Bank of Ethiopia</Text>
              <Text style={styles.bankDetail}>Account: 1000123456789</Text>
              <Text style={styles.bankDetail}>Account Holder: ZareShop Ltd</Text>
              <Text style={styles.bankDetail}>
                Reference: {payment.payment_reference}
              </Text>
            </View>
          )}

          <View style={styles.instructionSteps}>
            <Text style={styles.stepsTitle}>Steps to complete payment:</Text>
            <Text style={styles.step}>1. Make payment using the above details</Text>
            <Text style={styles.step}>2. Take a screenshot or photo of the receipt</Text>
            <Text style={styles.step}>3. Upload the proof using the button below</Text>
            <Text style={styles.step}>4. Wait for admin verification</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentProof = () => {
    if (!payment?.manual_payment_proof) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Proof</Text>
        <View style={styles.proofCard}>
          <Text style={styles.proofStatus}>✅ Proof uploaded</Text>
          <Text style={styles.proofDescription}>
            Your payment proof has been uploaded and is under review.
          </Text>
          <TouchableOpacity
            style={styles.viewProofButton}
            onPress={() => {
              if (payment.manual_payment_proof?.image_url) {
                Linking.openURL(payment.manual_payment_proof.image_url);
              }
            }}
          >
            <ExternalLink size={16} color={COLORS.primary} />
            <Text style={styles.viewProofText}>View Proof</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVendorInfo = () => {
    if (!payment?.vendor) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor Account</Text>
        <View style={styles.vendorCard}>
          <Text style={styles.vendorName}>✅ {payment.vendor.name}</Text>
          <Text style={styles.vendorStatus}>
            Status: {payment.vendor.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
          </Text>
          <Text style={styles.vendorActive}>
            Active: {payment.vendor.status ? '✅ Yes' : '❌ No'}
          </Text>
        </View>
      </View>
    );
  };

  const renderActions = () => {
    if (!payment) return null;


    return (
      <View style={styles.actionsSection}>
        {payment.status === 'pending' && payment.payment_method === 'manual' && !payment.manual_payment_proof && (
          <View>
            <ImageUploader
              label="Payment Proof"
              required
              image={proofImage ? { uri: proofImage.uri } : undefined}
              onPick={handleImagePicker}
              onRemove={removeProofImage}
              error={proofImageError}
            />
            
            {proofImage && (
              <View style={styles.uploadActions}>
                <CustomButton
                  title={uploadingProof ? `Uploading... ${uploadProgress}%` : "Upload Payment Proof"}
                  onPress={uploadProofImage}
                  loading={uploadingProof}
                  disabled={uploadingProof}
                  style={styles.actionButton}
                />
                {uploadingProof && uploadProgress > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${uploadProgress}%` as any }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{uploadProgress}%</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Unified application flow */}
        {payment.status === 'pending' && payment.payment_method === 'manual' && payment.manual_payment_proof && (
          <View style={styles.proceedSection}>
            <View style={styles.proceedInfo}>
              <Text style={styles.proceedTitle}>Ready to Submit Complete Application! 🚀</Text>
              <Text style={styles.proceedDescription}>
                Your payment proof has been uploaded. You can now submit your complete vendor application for unified admin review.
              </Text>
            </View>
            <CustomButton
              title="Submit Complete Application"
              onPress={() => {
                console.log('🚀 Navigating to complete application submission');
                navigateToScreen(`/auth/application?payment_id=${paymentId}`);
              }}
              style={[styles.proceedButton, { backgroundColor: COLORS.success }] as any}
            />
          </View>
        )}

        {payment.status === 'pending' && payment.payment_method === 'manual' && !payment.manual_payment_proof && (
          <View style={styles.proceedSection}>
            <View style={styles.proceedInfo}>
              <Text style={styles.proceedTitle}>Upload Payment Proof First 📤</Text>
              <Text style={styles.proceedDescription}>
                Please upload your payment proof above, then you can submit your complete application.
              </Text>
            </View>
          </View>
        )}

        {/* Completed payment - unified flow */}
        {payment.status === 'completed' && (
          <View style={styles.completedSection}>
            <View style={styles.completedInfo}>
              <Text style={styles.completedTitle}>Application Approved! ✅</Text>
              <Text style={styles.completedDescription}>
                {payment.vendor 
                  ? 'Your complete application has been approved by admin. You can now manage your business.'
                  : 'Your payment has been verified. You can now submit your complete application.'
                }
              </Text>
            </View>
            <CustomButton
              title={payment.vendor ? "Go to Dashboard" : "Submit Complete Application"}
              onPress={() => {
                if (payment.vendor) {
                  console.log('🚀 Navigating to dashboard...');
                  navigateToScreen('/(tabs)');
                } else {
                  console.log('🚀 Navigating to application...');
                  navigateToScreen(`/auth/application?payment_id=${paymentId}`);
                }
              }}
              style={[styles.proceedButton, { backgroundColor: COLORS.success }] as any}
            />
          </View>
        )}


        {payment.status === 'pending' && payment.payment_method === 'integrated' && (
          <CustomButton
            title="Complete Payment Online"
            onPress={() => {
              // This would open the payment gateway
              Alert.alert('Coming Soon', 'Online payment integration coming soon');
            }}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }] as any}
          />
        )}
      </View>
    );
  };

  if (paymentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (paymentError || !payment) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load payment details</Text>
          <CustomButton
            title="Retry"
            onPress={() => refetchPayment()}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <RefreshCw size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Payment Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            {getStatusIcon(payment.status)}
            <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
              {payment.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.paymentReference}>{payment.payment_reference}</Text>
          <Text style={styles.paymentAmount}>
            {payment.amount} {payment.currency}
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Method:</Text>
              <Text style={styles.detailValue}>
                {payment.payment_method === 'manual' ? 'Manual Payment' : 'Online Payment'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Provider:</Text>
              <Text style={styles.detailValue}>{payment.payment_provider}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {new Date(payment.created_at).toLocaleString()}
              </Text>
            </View>
            {payment.completed_at && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Completed:</Text>
                <Text style={styles.detailValue}>
                  {new Date(payment.completed_at).toLocaleString()}
                </Text>
              </View>
            )}
            {payment.subscription && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subscription:</Text>
                <Text style={styles.detailValue}>{payment.subscription.plan}</Text>
              </View>
            )}
          </View>
        </View>

        {renderPaymentInstructions()}
        {renderPaymentProof()}
        {renderVendorInfo()}
      </ScrollView>

      {renderActions()}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center' as const,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusSection: {
    alignItems: 'center' as const,
    padding: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  paymentReference: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
    flex: 1,
    textAlign: 'right' as const,
  },
  instructionsCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 16,
  },
  instructionItem: {
    marginBottom: 12,
  },
  instructionLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  instructionValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  copyableField: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  bankDetails: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  bankDetailsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  bankDetail: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 2,
  },
  instructionSteps: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  step: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
  },
  proofCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  proofStatus: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.success,
    marginBottom: 8,
  },
  proofDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
  viewProofButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  viewProofText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500' as const,
  },
  vendorCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.success,
    marginBottom: 8,
  },
  vendorStatus: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  vendorActive: {
    fontSize: 14,
    color: COLORS.text,
  },
  actionsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  uploadActions: {
    marginTop: 16,
  },
  proceedSection: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  proceedInfo: {
    marginBottom: 16,
  },
  proceedTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  proceedDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 0,
  },
  completedSection: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  completedInfo: {
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.success,
    marginBottom: 8,
  },
  completedDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden' as const,
  },
  progressFill: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500' as const,
    minWidth: 35,
    textAlign: 'right' as const,
  },
};

export default PaymentDetailScreen;
