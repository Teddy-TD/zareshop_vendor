import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

type StockStatus = 'active' | 'low_stock' | 'out_of_stock';

interface StockStatusBadgeProps {
  status: StockStatus;
  stock: number;
  lowStockThreshold: number;
  showDetails?: boolean;
}

export default function StockStatusBadge({ 
  status, 
  stock, 
  lowStockThreshold, 
  showDetails = false 
}: StockStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'In Stock',
          color: COLORS.success,
          backgroundColor: COLORS.successLight,
          icon: '✓'
        };
      case 'low_stock':
        return {
          label: 'Low Stock',
          color: COLORS.warning,
          backgroundColor: COLORS.warningLight,
          icon: '⚠'
        };
      case 'out_of_stock':
        return {
          label: 'Out of Stock',
          color: COLORS.error,
          backgroundColor: COLORS.errorLight,
          icon: '✗'
        };
      default:
        return {
          label: 'Unknown',
          color: COLORS.textLight,
          backgroundColor: COLORS.lightGray,
          icon: '?'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
        <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      </View>
      
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.stockText}>
            Stock: {stock} units
          </Text>
          {status === 'low_stock' && (
            <Text style={styles.thresholdText}>
              Alert when below {lowStockThreshold}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.xs,
  },
  icon: {
    fontSize: 12,
    marginRight: SIZES.xs,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    marginTop: SIZES.xs,
  },
  stockText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  thresholdText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});


