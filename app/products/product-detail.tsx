import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit, Trash2, Eye, Package, Tag, User, Calendar } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';
import CustomButton from '@/components/CustomButton';
import { useGetProductByIdQuery, useDeleteProductMutation } from '@/services/productApi';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const [refreshing, setRefreshing] = useState(false);

  const { data: productData, isLoading, error, refetch } = useGetProductByIdQuery(productId);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const product = productData?.product;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEditProduct = () => {
    if (product) {
      router.push({
        pathname: '/products/edit-product',
        params: { id: product.id.toString() }
      });
    }
  };

  const handleDeleteProduct = () => {
    if (!product) return;

    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id).unwrap();
              Alert.alert('Success', 'Product deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.data?.error || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) return COLORS.error;
    if (stock <= 10) return COLORS.warning;
    return COLORS.success;
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load product</Text>
          <CustomButton title="Retry" onPress={onRefresh} />
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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProduct}>
            <Edit size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteProduct}>
            <Trash2 size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Product Images */}
        {product.images && product.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {product.images.map((image, index) => (
                <Image
                  key={image.id}
                  source={{ uri: image.image_url }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Product Videos */}
        {product.videos && product.videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {product.videos.map((video, index) => (
                <View key={video.id} style={styles.videoContainer}>
                  <Image
                    source={{ uri: video.video_url }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.videoOverlay}>
                    <Eye size={24} color={COLORS.white} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <AnimatedCard style={styles.infoCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Package size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Stock</Text>
                <Text style={styles.infoValue}>{product.stock}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Tag size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>{typeof product.price === 'number' ? product.price : '—'}</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(product.stock) }
                ]} 
              />
              <Text style={styles.statusText}>{getStatusText(product.stock)}</Text>
            </View>
          </AnimatedCard>
        </View>

        {/* Category Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Information</Text>
          
          <AnimatedCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Tag size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{product.category?.name}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Tag size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Subcategory</Text>
                <Text style={styles.infoValue}>{product.subcategory?.name}</Text>
              </View>
            </View>
          </AnimatedCard>
        </View>

        {/* Vendor Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Information</Text>
          
          <AnimatedCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Vendor</Text>
                <Text style={styles.infoValue}>{product.vendor?.name}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Tag size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {product.vendor?.type === 'individual' ? 'Individual' : 'Business'}
                </Text>
              </View>
            </View>
          </AnimatedCard>
        </View>

        {/* Product Specifications */}
        {product.specs && product.specs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Specifications</Text>
            
            <AnimatedCard style={styles.infoCard}>
              {product.specs.map((spec, index) => (
                <View key={spec.id} style={styles.specItem}>
                  <Text style={styles.specKey}>{spec.key}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </AnimatedCard>
          </View>
        )}

        {/* Rating Information */}
        {product.rating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating Information</Text>
            
            <AnimatedCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Average Rating</Text>
                  <Text style={styles.infoValue}>
                    {product.rating.average_rating.toFixed(1)}/5
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Ratings</Text>
                  <Text style={styles.infoValue}>{product.rating.total_ratings}</Text>
                </View>
              </View>
            </AnimatedCard>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timestamps</Text>
          
          <AnimatedCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={16} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>{formatDate(product.created_at)}</Text>
              </View>
            </View>
          </AnimatedCard>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  headerActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoCard: {
    padding: SIZES.lg,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  productDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SIZES.lg,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    marginRight: SIZES.md,
  },
  videoContainer: {
    position: 'relative',
    marginRight: SIZES.md,
  },
  videoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specKey: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  specValue: {
    fontSize: 16,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
});

