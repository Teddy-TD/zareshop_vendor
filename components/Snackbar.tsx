import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "@/constants/theme";
import { X } from "lucide-react-native";

type SnackbarProps = {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
};

export default function Snackbar({
  message,
  type = "info",      // 'success', 'error', 'warning', 'info'
  duration = 3000,     // Auto-dismiss after 3s
  onClose,
}: SnackbarProps) {
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(100)); // starts off-screen

  useEffect(() => {
    if (message) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onClose && onClose();
    });
  };

  if (!visible) return null;

  const backgroundColors = {
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.primary,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: backgroundColors[type as keyof typeof backgroundColors] || COLORS.primary },
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={handleClose}>
        <X size={18} color={COLORS.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: SIZES.lg,
    left: SIZES.lg,
    right: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    flex: 1,
    marginRight: SIZES.sm,
  },
});
