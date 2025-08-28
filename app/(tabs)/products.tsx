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
} from 'react-native';
import { Plus, Search, Filter, MoveVertical as MoreVertical, Eye, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';
import CustomButton from '@/components/CustomButton';

export default function Products() {
  const [products] = useState([
    {
      id: 1,
      name: 'iPhone 14 Case',
      category: 'Electronics',
      price: '450 ETB',
      stock: 23,
      status: 'active',
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 2,
      name: 'Ethiopian Coffee Beans',
      category: 'Food & Beverages',
      price: '280 ETB',
      stock: 5,
      status: 'low_stock',
      image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 3,
      name: 'Traditional Dress',
      category: 'Fashion',
      price: '1,200 ETB',
      stock: 0,
      status: 'out_of_stock',
      image: 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 4,
      name: 'Leather Handbag',
      category: 'Fashion',
      price: '890 ETB',
      stock: 15,
      status: 'active',
      image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'low_stock':
        return COLORS.warning;
      case 'out_of_stock':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  const ProductCard = ({ product, delay = 0 }: { product: any; delay?: number }) => (
    <AnimatedCard delay={delay} style={styles.productCard}>
      <View style={styles.productHeader}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
          <View style={styles.stockContainer}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getStatusColor(product.status) }
              ]} 
            />
            <Text style={styles.stockText}>
              {product.stock} in stock • {getStatusText(product.status)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Edit size={16} color={COLORS.textLight} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Trash2 size={16} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </AnimatedCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textLight} />
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
      </View>

      {/* Product List */}
      <ScrollView 
        style={styles.productList}
        showsVerticalScrollIndicator={false}
      >
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
          onPress={() => {}}
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
});