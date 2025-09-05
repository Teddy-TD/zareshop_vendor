import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Search, Filter, MoveVertical as MoreVertical, Eye, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';
import CustomButton from '@/components/CustomButton';
import { 
  useGetProductsQuery, 
  useGetCategoriesQuery, 
  useDeleteProductMutation,
  useSearchProductsQuery,
  useGetProductsByStockStatusQuery 
} from '@/services/productApi';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStockStatus, setSelectedStockStatus] = useState<'all' | 'active' | 'low_stock' | 'out_of_stock'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // API hooks
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetProductsQuery({
    page: 1,
    limit: 50,
    category_id: selectedCategory || undefined,
  });

  const { data: stockStatusData, isLoading: isLoadingStockStatus } = useGetProductsByStockStatusQuery(
    { 
      status: selectedStockStatus as 'active' | 'low_stock' | 'out_of_stock',
      page: 1,
      limit: 50,
    },
    { skip: selectedStockStatus === 'all' }
  );

  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const { data: searchResults, isLoading: isSearching } = useSearchProductsQuery(
    { query: searchQuery, page: 1, limit: 50 },
    { skip: !searchQuery.trim() }
  );

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Use search results if searching, otherwise use filtered products
  const products = searchQuery.trim() 
    ? searchResults?.products || [] 
    : selectedStockStatus === 'all' 
      ? productsData?.products || []
      : stockStatusData?.products || [];
  
  const totalProducts = searchQuery.trim() 
    ? searchResults?.pagination.total || 0 
    : selectedStockStatus === 'all' 
      ? productsData?.pagination.total || 0
      : stockStatusData?.pagination.total || 0;
  const lowStockCount = products.filter(p => p.stock <= 10 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const handleAddProduct = () => {
    router.push('/products/add-product');
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(productId).unwrap();
              Alert.alert('Success', 'Product deleted successfully');
              refetchProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleEditProduct = (productId: number) => {
    router.push({
      pathname: '/products/edit-product',
      params: { id: productId.toString() }
    });
  };

  const handleViewProduct = (productId: number) => {
    router.push({
      pathname: '/products/product-detail',
      params: { id: productId.toString() }
    });
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) return COLORS.error;
    if (stock <= 10) return COLORS.warning;
    return COLORS.success;
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'Active';
  };

  const ProductCard = ({ product, delay = 0 }: { product: any; delay?: number }) => {
    const [imageFailed, setImageFailed] = React.useState(false);
    const imageUri = product?.images?.length ? product.images[0].image_url : undefined;
    const threshold = product?.low_stock_threshold ?? 10;
    const statusColor = imageUri !== undefined ? getStatusColor(product.stock <= threshold ? (product.stock) : product.stock) : getStatusColor(product.stock);
    const statusText = product.stock === 0 ? 'Out of Stock' : (product.stock <= threshold ? 'Low Stock' : 'In Stock');

    return (
      <AnimatedCard delay={delay} style={styles.productCard}>
        <View style={styles.productHeader}>
          {imageUri && !imageFailed ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.productImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category?.name || 'Uncategorized'}</Text>
            {typeof product.price === 'number' && (
              <Text style={styles.productPrice}>Price: {product.price}</Text>
            )}
            <View style={styles.stockContainer}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: product.stock === 0 ? COLORS.error : (product.stock <= threshold ? COLORS.warning : COLORS.success) }
                ]} 
              />
              <Text style={styles.stockText}>
                {product.stock} in stock • {statusText}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewProduct(product.id)}
          >
            <Eye size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditProduct(product.id)}
          >
            <Edit size={16} color={COLORS.textLight} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteProduct(product.id, product.name)}
            disabled={isDeleting}
          >
            <Trash2 size={16} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory ? styles.filterButtonActive : null]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={selectedCategory ? COLORS.white : COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {showFilters && categoriesData && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Stock status chips */}
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedStockStatus === 'all' ? styles.categoryChipActive : null
              ]}
              onPress={() => setSelectedStockStatus('all')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedStockStatus === 'all' ? styles.categoryChipTextActive : null
              ]}>All Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedStockStatus === 'active' ? styles.categoryChipActive : null
              ]}
              onPress={() => setSelectedStockStatus('active')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedStockStatus === 'active' ? styles.categoryChipTextActive : null
              ]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedStockStatus === 'low_stock' ? styles.categoryChipActive : null
              ]}
              onPress={() => setSelectedStockStatus('low_stock')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedStockStatus === 'low_stock' ? styles.categoryChipTextActive : null
              ]}>Low Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedStockStatus === 'out_of_stock' ? styles.categoryChipActive : null
              ]}
              onPress={() => setSelectedStockStatus('out_of_stock')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedStockStatus === 'out_of_stock' ? styles.categoryChipTextActive : null
              ]}>Out of Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory ? styles.categoryChipActive : null
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryChipText,
                !selectedCategory ? styles.categoryChipTextActive : null
              ]}>
                All Categories
              </Text>
            </TouchableOpacity>
            {categoriesData.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id ? styles.categoryChipActive : null
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id ? styles.categoryChipTextActive : null
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
      </View>

      {/* Loading State */}
      {isLoadingProducts && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      )}

      {/* Product List */}
      <ScrollView 
        style={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoadingProducts} onRefresh={refetchProducts} />
        }
      >
        {products.length === 0 && !isLoadingProducts && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() ? 'No products found for your search' : 'No products available'}
            </Text>
          </View>
        )}
        
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            delay={index * 100} 
          />
        ))}
      </ScrollView>

      {/* Add Product Button */}
      <View style={styles.bottomContainer}>
        <CustomButton
          title="Add New Product"
          onPress={handleAddProduct}
          style={styles.addProductButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginRight: SIZES.sm,
  },
  searchInput: {
    marginLeft: SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  searchPlaceholder: {
    marginLeft: SIZES.sm,
    color: COLORS.textLight,
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterContainer: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  categoryChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    marginRight: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  productList: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  productCard: {
    marginBottom: SIZES.sm,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    marginRight: SIZES.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SIZES.xs,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  moreButton: {
    padding: SIZES.xs,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  actionText: {
    marginLeft: SIZES.xs,
    fontSize: 14,
    color: COLORS.textLight,
  },
  bottomContainer: {
    padding: SIZES.md,
  },
  addProductButton: {
    marginBottom: SIZES.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.md,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});