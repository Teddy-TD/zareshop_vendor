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
import { ArrowLeft, Camera, Upload, X, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';

export default function AddProductScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    discount: '',
    stock: '',
    cashOnDelivery: true,
    featured: false,
    promotions: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddImage = () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload maximum 5 images');
      return;
    }
    // This would typically open image picker
    Alert.alert('Add Image', 'Image picker will be implemented here');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVideo = () => {
    if (video) {
      Alert.alert('Video Exists', 'You can only upload one video per product');
      return;
    }
    // This would typically open video picker
    Alert.alert('Add Video', 'Video picker will be implemented here');
  };

  const handleRemoveVideo = () => {
    setVideo('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.category || 
        !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please upload at least one product image');
      return;
    }

    if (!video) {
      Alert.alert('Error', 'Please upload a product video');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Product added successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 2000);
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
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter product title"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your product in detail"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Electronics"
                value={formData.category}
                onChangeText={(value) => updateFormData('category', value)}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Subcategory</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Smartphones"
                value={formData.subcategory}
                onChangeText={(value) => updateFormData('subcategory', value)}
              />
            </View>
          </View>
        </View>

        {/* Pricing & Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Price (ETB) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(value) => updateFormData('price', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                value={formData.discount}
                onChangeText={(value) => updateFormData('discount', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stock Quantity *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter available stock"
              value={formData.stock}
              onChangeText={(value) => updateFormData('stock', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Media</Text>
          
          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Images * (Max 5)</Text>
            <View style={styles.mediaGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.mediaItem}>
                  <View style={styles.mediaPreview} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addMediaButton} onPress={handleAddImage}>
                  <Plus size={24} color={COLORS.primary} />
                  <Text style={styles.addMediaText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Video */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Video *</Text>
            {video ? (
              <View style={styles.videoContainer}>
                <View style={styles.videoPreview} />
                <TouchableOpacity
                  style={styles.removeVideoButton}
                  onPress={handleRemoveVideo}
                >
                  <X size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addVideoButton} onPress={handleAddVideo}>
                <Camera size={24} color={COLORS.primary} />
                <Text style={styles.addVideoText}>Add Video</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Cash on Delivery</Text>
            <Switch
              value={formData.cashOnDelivery}
              onValueChange={(value) => updateFormData('cashOnDelivery', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Featured Product</Text>
            <Switch
              value={formData.featured}
              onValueChange={(value) => updateFormData('featured', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Promotions</Text>
            <Switch
              value={formData.promotions}
              onValueChange={(value) => updateFormData('promotions', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <CustomButton
          title="Add Product"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
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
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  halfWidth: {
    flex: 1,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  mediaItem: {
    position: 'relative',
  },
  mediaPreview: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaButton: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  videoContainer: {
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeVideoButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVideoButton: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVideoText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: SIZES.sm,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  bottomContainer: {
    padding: SIZES.lg,
  },
  submitButton: {
    marginBottom: SIZES.sm,
  },
});
