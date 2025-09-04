import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

export const styles = StyleSheet.create({
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
	progressContainer: {
		paddingHorizontal: SIZES.md,
		paddingBottom: SIZES.lg,
	},
	progressBar: {
		height: 4,
		backgroundColor: COLORS.border,
		borderRadius: 2,
		marginBottom: SIZES.sm,
	},
	progressFill: {
		height: '100%',
		backgroundColor: COLORS.primary,
		borderRadius: 2,
	},
	progressText: {
		fontSize: 12,
		color: COLORS.textLight,
		textAlign: 'center',
	},
	content: {
		flex: 1,
		paddingHorizontal: SIZES.md,
	},
	stepContainer: {
		paddingBottom: SIZES.xl,
	},
	stepTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SIZES.xs,
	},
	stepSubtitle: {
		fontSize: 16,
		color: COLORS.textLight,
		marginBottom: SIZES.lg,
	},
	inputGroup: {
		marginBottom: SIZES.lg,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SIZES.sm,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: SIZES.radius,
		paddingHorizontal: SIZES.md,
		paddingVertical: SIZES.md,
	},
	textInput: {
		flex: 1,
		marginLeft: SIZES.sm,
		fontSize: 16,
		color: COLORS.text,
	},
	textArea: {
		height: 80,
		textAlignVertical: 'top',
	},
	navigation: {
		flexDirection: 'row',
		padding: SIZES.md,
		alignItems: 'center',
	},
	backButtonText: {
		fontSize: 16,
		color: COLORS.textLight,
		fontWeight: '600',
		paddingHorizontal: SIZES.md,
	},
	nextButton: {
		flex: 1,
	},
	// Error styles
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fef2f2',
		borderColor: COLORS.error,
		borderWidth: 1,
		borderRadius: SIZES.radius,
		padding: SIZES.md,
		marginBottom: SIZES.lg,
	},
	registerErrorText: {
		color: COLORS.error,
		fontSize: 14,
		marginLeft: SIZES.sm,
		flex: 1,
		lineHeight: 20,
	},
	errorDismissButton: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: COLORS.error,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: SIZES.sm,
	},
	errorDismissText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: 'bold',
		lineHeight: 16,
	},
	inputContainerError: {
		borderColor: COLORS.error,
		backgroundColor: '#fef2f2',
		borderWidth: 1,
	},
	errorText: {
		color: COLORS.error,
		fontSize: 14,
		marginTop: SIZES.sm,
		marginLeft: SIZES.sm,
	},
	phonePrefix: {
		fontSize: 16,
		color: COLORS.text,
		fontWeight: '500',
		marginRight: SIZES.sm,
	},
});


