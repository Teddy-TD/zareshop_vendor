import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';

export default function PendingApprovalScreen() {
  const handleGoBack = () => {
    router.replace('/onboarding');
  };

  const handleContactSupport = () => {
    // This would typically open email or phone
    console.log('Contact support');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={styles.statusIconContainer}>
          <View style={styles.statusIcon}>
            <Clock size={48} color={COLORS.warning} />
          </View>
        </View>

        {/* Status Title */}
        <Text style={styles.statusTitle}>Application Under Review</Text>
        <Text style={styles.statusSubtitle}>
          Thank you for submitting your vendor application. Our team is currently reviewing your information.
        </Text>

        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotCompleted]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Application Submitted</Text>
              <Text style={styles.timelineSubtitle}>Your application has been received</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotCurrent]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Under Review</Text>
              <Text style={styles.timelineSubtitle}>Our team is verifying your information</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotPending]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Approval Decision</Text>
              <Text style={styles.timelineSubtitle}>You'll receive notification of the decision</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotPending]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Account Activation</Text>
              <Text style={styles.timelineSubtitle}>Start selling on ZareShop</Text>
            </View>
          </View>
        </View>

        {/* Estimated Time */}
        <View style={styles.estimatedTime}>
          <Clock size={20} color={COLORS.textLight} />
          <Text style={styles.estimatedTimeText}>
            Estimated review time: 2-3 business days
          </Text>
        </View>

        {/* What Happens Next */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>What happens next?</Text>
          <View style={styles.nextStepsList}>
            <View style={styles.nextStepItem}>
              <CheckCircle size={16} color={COLORS.success} />
              <Text style={styles.nextStepText}>
                We'll verify your business information and documents
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <CheckCircle size={16} color={COLORS.success} />
              <Text style={styles.nextStepText}>
                You'll receive an email notification with the decision
              </Text>
            </View>
            <View style={styles.nextStepItem}>
              <CheckCircle size={16} color={COLORS.success} />
              <Text style={styles.nextStepText}>
                If approved, you can start setting up your store
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <CustomButton
          title="Contact Support"
          onPress={handleContactSupport}
          style={styles.contactButton}
          variant="outline"
        />
        
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={handleGoBack}
        >
          <Text style={styles.backToHomeText}>Back to Home</Text>
        </TouchableOpacity>
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
    paddingTop: SIZES.xl,
  },
  statusIconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  statusIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  statusSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xl,
  },
  timeline: {
    marginBottom: SIZES.xl,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.lg,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SIZES.md,
    marginTop: 2,
  },
  timelineDotCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.warning,
  },
  timelineDotPending: {
    backgroundColor: COLORS.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.xl,
  },
  estimatedTimeText: {
    marginLeft: SIZES.sm,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  nextSteps: {
    marginBottom: SIZES.xl,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  nextStepsList: {
    gap: SIZES.sm,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nextStepText: {
    marginLeft: SIZES.sm,
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    flex: 1,
  },
  bottomActions: {
    padding: SIZES.lg,
    gap: SIZES.sm,
  },
  contactButton: {
    marginBottom: SIZES.sm,
  },
  backToHomeButton: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  backToHomeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
