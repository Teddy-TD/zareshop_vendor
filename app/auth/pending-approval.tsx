import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { COLORS, SIZES } from "@/constants/theme";
import CustomButton from "@/components/CustomButton";

export default function PendingApprovalScreen() {
  const handleGoBack = () => {
    router.replace("/auth/login");
  };

  const handleContactSupport = () => {
    console.log("Contact support");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Clock size={56} color={COLORS.warning} />
          </View>
          <Text style={styles.statusTitle}>Application Under Review</Text>
          <Text style={styles.statusSubtitle}>
            Thank you for submitting your vendor application. Our team is
            currently reviewing your information.
          </Text>
        </View>

        {/* Stepper / Timeline */}
        <View style={styles.stepper}>
          <Step
            title="Application Submitted"
            subtitle="We have received your application"
            completed active={undefined}          />
          <Step
            title="Under Review"
            subtitle="Our team is verifying your information"
            completed active={undefined}
          />
          <Step
            title="Approval Decision"
            subtitle="You'll receive an email with the result"
            completed active={undefined}
          />
          <Step
            title="Account Activation"
            subtitle="If approved, start selling on ZareShop"
            completed active={undefined}
            
          />
        </View>

        {/* Estimated Time */}
        <View style={styles.estimatedTime}>
          <Clock size={18} color={COLORS.textLight} />
          <Text style={styles.estimatedTimeText}>
            Estimated review time: 2–3 business days
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>What happens next?</Text>
          <View style={styles.nextStepsList}>
            <NextStep text="We'll verify your business information and documents" />
            <NextStep text="You'll receive an email notification with the decision" />
            <NextStep text="If approved, you can start setting up your store" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <CustomButton
          title="Contact Support"
          onPress={handleContactSupport}
          variant="outline"
        />

        {/* <TouchableOpacity style={styles.backToHomeButton} onPress={handleGoBack}>
          <Text style={styles.backToHomeText}>Back to Login</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}

/* Step Component */
type StepProps = {
  title: string;
  subtitle: string;
  completed?: boolean;
  active?: boolean;
};

const Step = ({ title, subtitle, completed, active }: StepProps) => (
  <View style={styles.step}>
    <View
      style={[
        styles.stepIcon,
        completed
          ? { backgroundColor: COLORS.success }
          : active
          ? { backgroundColor: COLORS.warning }
          : { backgroundColor: COLORS.border },
      ]}
    >
      {completed ? (
        <CheckCircle size={16} color={COLORS.white} />
      ) : active ? (
        <Clock size={16} color={COLORS.white} />
      ) : (
        <AlertCircle size={16} color={COLORS.white} />
      )}
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

/* Next Step Item */
type NextStepProps = {
  text: string;
};

const NextStep = ({ text }: NextStepProps) => (
  <View style={styles.nextStepItem}>
    <CheckCircle size={16} color={COLORS.success} />
    <Text style={styles.nextStepText}>{text}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SIZES.md,
    paddingTop: SIZES.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusCard: {
    margin: SIZES.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statusIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.warning + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.sm,
  },
  statusSubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
  stepper: {
    marginTop: SIZES.lg,
    marginHorizontal: SIZES.lg,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SIZES.lg,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    margin: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
  },
  estimatedTimeText: {
    marginLeft: SIZES.sm,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  nextSteps: {
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.xl,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  nextStepsList: {
    gap: SIZES.sm,
  },
  nextStepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nextStepText: {
    marginLeft: SIZES.sm,
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    flex: 1,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backToHomeButton: {
    alignItems: "center",
    paddingVertical: SIZES.md,
  },
  backToHomeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
