import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { ArrowLeft, Camera, Upload, X, Plus, ChevronDown, Save } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';
import { 
  useGetProductByIdQuery,
  useGetCategoriesQuery, 
  useGetSubcategoriesByCategoryQuery,
  useUpdateProductMutation 
} from '@/services/productApi';
import * as ImagePicker from 'expo-image-picker';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const [isLoading, setIsLoading] = useState(false);

  // API hooks
  const { data: productData, isLoading: isLoadingProduct } = useGetProductByIdQuery(productId);
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: subcategoriesData, isLoading: isLoadingSubcategories } = useGetSubcategoriesByCategoryQuery(
    Number(productData?.product?.category_id || 0),
    { skip: !productData?.product?.category_id }
  );
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    stock: '',
    has_discount: false,
    specs: [] as string[],
  });

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [videos, setVideos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [existingVideos, setExistingVideos] = useState<any[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  // Initialize form data when product loads
  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;
      setFormData({
        name: product.name,
        description: product.description || '',
        category_id: product.category_id.toString(),
        subcategory_id: product.subcategory_id.toString(),
        stock: product.stock.toString(),
        has_discount: product.has_discount,
        specs: product.specs?.map(spec => `${spec.key}: ${spec.value}`) || [],
      });
      setExistingImages(product.images || []);
      setExistingVideos(product.videos || []);
    }
  }, [productData]);

  const updateFormData = (key: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear subcategory when category changes
    if (key === 'category_id') {
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  };

  const handleAddImage = async () => {
    if (images.length + existingImages.length >= 10) {
      Alert.alert('Limit Reached', 'You can upload maximum 10 images total');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVideo = async () => {
    if (videos.length + existingVideos.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload maximum 5 videos total');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your video library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setVideos(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingVideo = (index: number) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
  };

  const getCategoryName = (id: string) => {
    if (!categoriesData?.categories) return 'Select Category';
    const category = categoriesData.categories.find(cat => cat.id === Number(id));
    return category?.name || 'Select Category';
  };

  const getSubcategoryName = (id: string) => {
    if (!subcategoriesData?.subcategories) return 'Select Subcategory';
    const subcategory = subcategoriesData.subcategories.find(sub => sub.id === Number(id));
    return subcategory?.name || 'Select Subcategory';
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter product description');
      return false;
    }
    if (!formData.category_id) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.subcategory_id) {
      Alert.alert('Error', 'Please select a subcategory');
      return false;
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      Alert.alert('Error', 'Please enter valid stock quantity');
      return false;
    }
    if (existingImages.length + images.length === 0) {
      Alert.alert('Error', 'Please keep at least one product image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const productData: Record<string, any> = {
        id: productId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        stock: Number(formData.stock),
        has_discount: formData.has_discount,
        category_id: Number(formData.category_id),
        subcategory_id: Number(formData.subcategory_id),
        specs: formData.specs.map(spec => {
          const [key, value] = spec.split(': ');
          return { key: key.trim(), value: value.trim() };
        }),
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add product data
      Object.keys(productData).forEach(key => {
        if (key === 'specs') {
          formDataToSend.append(key, JSON.stringify(productData[key]));
        } else if (key !== 'id') {
          formDataToSend.append(key, productData[key].toString());
        }
      });

      // Add new images
      images.forEach((image, index) => {
        const imageFile = {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any;
        formDataToSend.append('images', imageFile);
      });

      // Add new videos if exists
      videos.forEach((video, index) => {
        const videoFile = {
          uri: video.uri,
          type: 'video/mp4',
          name: `video_${index}.mp4`,
        } as any;
        formDataToSend.append('videos', videoFile);
      });

      const result = await updateProduct({ id: productId, body: formDataToSend }).unwrap();
      
      Alert.alert(
        'Success',
        'Product updated successfully! New files are being processed in the background.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || 'Failed to update product';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!productData?.product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <CustomButton title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {isLoadingCategories && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
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
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={isLoadingCategories}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  formData.category_id ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder
                ]}>
                  {isLoadingCategories ? 'Loading...' : getCategoryName(formData.category_id)}
                </Text>
                <ChevronDown size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              {showCategoryDropdown && categoriesData?.categories && (
                <View style={styles.dropdownList}>
                  {categoriesData.categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateFormData('category_id', category.id.toString());
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Subcategory *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                disabled={!formData.category_id || isLoadingSubcategories}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  formData.subcategory_id ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder
                ]}>
                  {isLoadingSubcategories ? 'Loading...' : getSubcategoryName(formData.subcategory_id)}
                </Text>
                <ChevronDown size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              {showSubcategoryDropdown && subcategoriesData?.subcategories && (
                <View style={styles.dropdownList}>
                  {subcategoriesData.subcategories.map((subcategory) => (
                    <TouchableOpacity
                      key={subcategory.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateFormData('subcategory_id', subcategory.id.toString());
                        setShowSubcategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{subcategory.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Information</Text>
          
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

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Has Discount</Text>
            <Switch
              value={formData.has_discount}
              onValueChange={(value) => updateFormData('has_discount', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Media</Text>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Existing Images</Text>
              <View style={styles.mediaGrid}>
                {existingImages.map((image, index) => (
                  <View key={image.id} style={styles.mediaItem}>
                    <Image source={{ uri: image.image_url }} style={styles.mediaPreview} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveExistingImage(index)}
                    >
                      <X size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* New Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Add New Images (Max {10 - existingImages.length})</Text>
            <View style={styles.mediaGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: image.uri }} style={styles.mediaPreview} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length + existingImages.length < 10 && (
                <TouchableOpacity style={styles.addMediaButton} onPress={handleAddImage}>
                  <Plus size={24} color={COLORS.primary} />
                  <Text style={styles.addMediaText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Existing Videos */}
          {existingVideos.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Existing Videos</Text>
              <View style={styles.mediaGrid}>
                {existingVideos.map((video, index) => (
                  <View key={video.id} style={styles.mediaItem}>
                    <Image source={{ uri: video.video_url }} style={styles.mediaPreview} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveExistingVideo(index)}
                    >
                      <X size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* New Videos */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Add New Videos (Max {5 - existingVideos.length})</Text>
            {videos.length + existingVideos.length < 5 ? (
              <TouchableOpacity style={styles.addVideoButton} onPress={handleAddVideo}>
                <Camera size={24} color={COLORS.primary} />
                <Text style={styles.addVideoText}>Add Video</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.videoContainer}>
                {videos.map((video, index) => (
                  <View key={index} style={styles.videoPreview}>
                    <Image source={{ uri: video.uri }} style={styles.videoThumbnail} />
                    <TouchableOpacity
                      style={styles.removeVideoButton}
                      onPress={() => handleRemoveVideo(index)}
                    >
                      <X size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Product Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Specifications (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Add technical specifications for your product
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specifications</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter product specifications (e.g., Material: Cotton, Size: M, Color: Blue)"
              value={formData.specs.join(', ')}
              onChangeText={(value) => {
                const specsArray = value.split(',').map(spec => spec.trim()).filter(spec => spec);
                setFormData(prev => ({ ...prev, specs: specsArray }));
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Separate multiple specifications with commas
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <CustomButton
          title="Update Product"
          onPress={handleSubmit}
          loading={isLoading || isUpdating}
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  dropdownButtonTextPlaceholder: {
    color: COLORS.textLight,
  },
  dropdownButtonTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SIZES.xs,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text,
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
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  videoPreview: {
    position: 'relative',
  },
  videoThumbnail: {
    width: 120,
    height: 120,
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
  loadingContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SIZES.md,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    fontStyle: 'italic',
  },
});
