import React from 'react';
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
import { User, Store, Clock, MapPin, Phone, Mail, Settings, CircleHelp as HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import AnimatedCard from '@/components/AnimatedCard';

export default function Profile() {
  const MenuSection = ({ title, items, delay = 0 }: { 
    title: string; 
    items: Array<{ 
      icon: any; 
      label: string; 
      value?: string; 
      onPress?: () => void; 
      color?: string;
    }>; 
    delay?: number;
  }) => (
    <AnimatedCard delay={delay} style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <IconComponent 
                size={20} 
                color={item.color || COLORS.textLight} 
              />
              <Text style={[
                styles.menuItemLabel,
                item.color && { color: item.color }
              ]}>
                {item.label}
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              {item.value && (
                <Text style={styles.menuItemValue}>{item.value}</Text>
              )}
              <ChevronRight size={16} color={COLORS.textLight} />
            </View>
          </TouchableOpacity>
        );
      })}
    </AnimatedCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <AnimatedCard delay={0} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John's Electronics</Text>
              <Text style={styles.profileType}>Individual Vendor</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>4.8</Text>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>156</Text>
              <Text style={styles.profileStatLabel}>Products</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>2.5k</Text>
              <Text style={styles.profileStatLabel}>Orders</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Store Information */}
        <MenuSection
          title="Store Information"
          delay={100}
          items={[
            {
              icon: Store,
              label: 'Store Name',
              value: "John's Electronics",
              onPress: () => {},
            },
            {
              icon: MapPin,
              label: 'Address',
              value: 'Addis Ababa, Ethiopia',
              onPress: () => {},
            },
            {
              icon: Clock,
              label: 'Business Hours',
              value: '9:00 AM - 6:00 PM',
              onPress: () => {},
            },
          ]}
        />

        {/* Contact Information */}
        <MenuSection
          title="Contact Information"
          delay={200}
          items={[
            {
              icon: Phone,
              label: 'Phone Number',
              value: '+251 91 123 4567',
              onPress: () => {},
            },
            {
              icon: Mail,
              label: 'Email Address',
              value: 'john@electronics.com',
              onPress: () => {},
            },
          ]}
        />

        {/* Account Settings */}
        <MenuSection
          title="Account Settings"
          delay={300}
          items={[
            {
              icon: User,
              label: 'Personal Information',
              onPress: () => {},
            },
            {
              icon: Settings,
              label: 'Preferences',
              onPress: () => {},
            },
            {
              icon: HelpCircle,
              label: 'Help & Support',
              onPress: () => {},
            },
          ]}
        />

        {/* Logout */}
        <MenuSection
          title=""
          delay={400}
          items={[
            {
              icon: LogOut,
              label: 'Logout',
              color: COLORS.error,
              onPress: () => {},
            },
          ]}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: SIZES.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  profileType: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SIZES.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: SIZES.xs,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  menuSection: {
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SIZES.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: SIZES.sm,
  },
  bottomPadding: {
    height: SIZES.xl,
  },
});