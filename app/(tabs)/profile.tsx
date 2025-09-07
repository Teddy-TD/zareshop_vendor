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
import { useAuth } from '@/hooks/useAuth';
import AuthDebug from '@/components/AuthDebug';
import { useGetUserProfileQuery } from '@/services/authApi';

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profile, isLoading, error, refetch } = useGetUserProfileQuery();
  
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
        <TouchableOpacity style={styles.settingsButton} onPress={() => refetch()}>
          <Settings size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading / Error */}
        {isLoading && (
          <View style={{ paddingHorizontal: SIZES.md, paddingVertical: SIZES.md }}>
            <Text style={{ color: COLORS.textLight }}>Loading profile…</Text>
          </View>
        )}
        {error && (
          <View style={{ paddingHorizontal: SIZES.md, paddingVertical: SIZES.md }}>
            <Text style={{ color: COLORS.error }}>Failed to load profile</Text>
          </View>
        )}

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
              <Text style={styles.profileName}>{profile?.name || user?.name || 'Vendor'}</Text>
              <Text style={styles.profileType}>{
                (profile?.type || user?.type) === 'vendor_owner' ? 'Vendor Owner' : 
                (profile?.type || user?.type) === 'client' ? 'Client' :
                (profile?.type || user?.type) === 'driver' ? 'Driver' :
                (profile?.type || user?.type) === 'admin' ? 'Admin' :
                (profile?.type || user?.type) === 'employee' ? 'Employee' :
                'User'
              }</Text>
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
        {(profile as any)?.vendor && (
          <MenuSection
            title="Store Information"
            delay={100}
            items={[
              {
                icon: Store,
                label: 'Store Name',
                value: (profile as any)?.vendor?.name || 'Not set',
                onPress: () => {},
              },
              {
                icon: MapPin,
                label: 'Store Type',
                value: (profile as any)?.vendor?.type === 'individual' ? 'Individual' : 'Business',
                onPress: () => {},
              },
              {
                icon: Clock,
                label: 'Status',
                value: (profile as any)?.vendor?.is_approved ? 'Approved' : 'Pending Approval',
                onPress: () => {},
              },
            ]}
          />
        )}

        {/* Contact Information */}
        <MenuSection
          title="Contact Information"
          delay={200}
          items={[
            {
              icon: Phone,
              label: 'Phone Number',
              value: profile?.phone_number || user?.phone_number || 'Not provided',
              onPress: () => {},
            },
            {
              icon: Mail,
              label: 'Email Address',
              value: profile?.email || user?.email || 'Not provided',
              onPress: () => {},
            },
          ]}
        />

        {/* Wallet Information (for vendors) */}
        {(profile as any)?.vendor?.wallet && (
          <MenuSection
            title="Wallet Information"
            delay={250}
            items={[
              {
                icon: Store,
                label: 'Wallet Balance',
                value: `${(profile as any)?.vendor?.wallet?.balance?.toLocaleString() || 0} ETB`,
                onPress: () => {},
              },
              {
                icon: Clock,
                label: 'Wallet Status',
                value: (profile as any)?.vendor?.wallet?.status === 'active' ? 'Active' : 
                       (profile as any)?.vendor?.wallet?.status === 'suspended' ? 'Suspended' : 'Closed',
                onPress: () => {},
              },
            ]}
          />
        )}

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
              onPress: logout,
            },
          ]}
        />

        {/* Debug Info - Remove this in production */}
        <AuthDebug />
        
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