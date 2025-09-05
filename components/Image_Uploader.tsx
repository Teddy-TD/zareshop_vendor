import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Camera, X } from "lucide-react-native";
import { COLORS, SIZES } from "@/constants/theme";


type ImageUploaderProps = {
  label: string;
  image?: { uri: string };
  onPick: () => void;
  onRemove: () => void;
  error?: string;
  required?: boolean;
};

export default function ImageUploader({
  label,
  image,
  onPick,
  onRemove,
  error,
  required,
}: ImageUploaderProps) {
  return (
    <View style={styles.inputSection}>
      {/* Label */}
      <Text style={styles.inputLabel}>
        {label} {required ? <Text style={{ color: COLORS.danger } as any}>*</Text> : null}
      </Text>

      {/* Upload Area */}
      {image ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <X size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadBox, error ? styles.errorBorder : undefined]}
          onPress={onPick}
          activeOpacity={0.7}
        >
          <Camera size={28} color={COLORS.primary} />
          <Text style={styles.uploadText}>Tap to upload</Text>
        </TouchableOpacity>
      )}

      {/* Error Helper */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    marginBottom: SIZES.lg,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  uploadBox: {
    height: 150,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  uploadText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textLight,
  },
  imageWrapper: {
    position: "relative",
    height: 180,
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.danger as any,
    borderRadius: 20,
    padding: 4,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.danger as any,
  },
  errorBorder: {
    borderColor: COLORS.danger as any,
  },
});
